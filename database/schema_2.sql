-- MoneyTrack 개인 비용 관리 앱 데이터베이스 스키마 (v2.0)
-- Supabase PostgreSQL 용
-- Supabase Auth 인증 시스템 사용, 사용자별 데이터 분리

-- 기존 테이블이 있다면 삭제 (깔끔한 재생성을 위해)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 기존 뷰 삭제
DROP VIEW IF EXISTS monthly_expense_summary CASCADE;
DROP VIEW IF EXISTS category_expense_summary CASCADE;
DROP VIEW IF EXISTS expense_details CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS set_default_user_id() CASCADE;

-- 1. users 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. categories 테이블 (지출 카테고리 - 모든 사용자 공통)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. expenses 테이블 (메인 지출 데이터 - 사용자별 분리)
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
CREATE INDEX idx_users_email ON users(email);

-- 6. RLS (Row Level Security) 정책 설정 - 사용자별 데이터 분리
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- users 테이블 정책: 본인 데이터만 접근 가능
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- expenses 테이블 정책: 본인 지출만 접근 가능
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- categories 테이블 정책: 모든 인증된 사용자가 읽기 가능
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- 7. 사용자 생성 트리거 (회원가입 시 users 테이블에 자동 추가)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Auth 사용자 생성 시 트리거 실행
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. updated_at 트리거 적용
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 11. 유용한 뷰 생성 (사용자별 필터링 적용)
-- 월별 지출 요약 뷰 (현재 사용자만)
CREATE VIEW monthly_expense_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', expense_date) AS month,
  COUNT(*) AS expense_count,
  SUM(amount) AS total_amount,
  AVG(amount) AS avg_amount
FROM expenses
WHERE user_id = auth.uid()
GROUP BY user_id, DATE_TRUNC('month', expense_date);

-- 카테고리별 지출 요약 뷰 (현재 사용자만)
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
WHERE e.user_id = auth.uid()
GROUP BY e.user_id, c.id, c.name, c.icon, c.color;

-- 지출 상세 뷰 (현재 사용자만)
CREATE VIEW expense_details AS
SELECT 
  e.id,
  e.amount,
  e.expense_date,
  e.memo,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  e.created_at
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = auth.uid()
ORDER BY e.expense_date DESC, e.created_at DESC;

-- 12. 사용자 통계 뷰
CREATE VIEW user_statistics AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  COUNT(e.id) AS total_expenses,
  COALESCE(SUM(e.amount), 0) AS total_amount,
  COALESCE(AVG(e.amount), 0) AS avg_expense,
  MIN(e.expense_date) AS first_expense_date,
  MAX(e.expense_date) AS last_expense_date
FROM users u
LEFT JOIN expenses e ON u.id = e.user_id
WHERE u.id = auth.uid()
GROUP BY u.id, u.name, u.email;

-- 13. Auth 설정을 위한 추가 정책
-- Email 인증이 완료된 사용자만 접근 허용하려면 아래 주석 해제
-- CREATE POLICY "Only confirmed users" ON users
--   FOR ALL USING (auth.jwt() ->> 'email_confirmed_at' IS NOT NULL);

-- 스키마 생성 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'MoneyTrack 스키마 v2.0 생성 완료!';
  RAISE NOTICE '- Supabase Auth 인증 시스템 사용';
  RAISE NOTICE '- 사용자별 데이터 완전 분리';
  RAISE NOTICE '- 이메일/비밀번호 로그인 지원';
  RAISE NOTICE '- 비밀번호 재설정 기능 지원';
  RAISE NOTICE '- Row Level Security 적용';
  RAISE NOTICE '==========================================';
END
$$; 