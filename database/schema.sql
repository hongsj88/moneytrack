-- MoneyTrack 개인 비용 관리 앱 데이터베이스 스키마
-- Supabase PostgreSQL 용

-- 1. users 테이블 (Supabase Auth에서 자동 생성되는 auth.users와 연동)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. categories 테이블 (지출 카테고리)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. expenses 테이블 (메인 지출 데이터)
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 기본 카테고리 데이터 삽입
INSERT INTO categories (name, icon, color) VALUES
('식비', 'Utensils', 'orange'),
('교통비', 'Car', 'blue'),
('쇼핑', 'ShoppingCart', 'purple'),
('기타', 'MoreHorizontal', 'gray');

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- 6. RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- users 테이블 정책
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- expenses 테이블 정책
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- categories 테이블은 모든 사용자가 읽기 가능
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- 7. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 적용
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 9. 사용자 생성 트리거 (회원가입 시 users 테이블에 자동 추가)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. 유용한 뷰 생성
-- 월별 지출 요약 뷰
CREATE VIEW monthly_expense_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', expense_date) AS month,
  COUNT(*) AS expense_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount
FROM expenses
GROUP BY user_id, DATE_TRUNC('month', expense_date);

-- 카테고리별 지출 요약 뷰
CREATE VIEW category_expense_summary AS
SELECT 
  e.user_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount,
  AVG(e.amount) AS avg_amount
FROM expenses e
JOIN categories c ON e.category_id = c.id
GROUP BY e.user_id, c.id, c.name, c.icon, c.color; 