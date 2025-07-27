-- MoneyTrack 개인 비용 관리 앱 데이터베이스 스키마 (v1.1)
-- Supabase PostgreSQL 용
-- 인증 없이 사용 가능하도록 수정된 버전

-- 기존 테이블이 있다면 삭제 (깔끔한 재생성을 위해)
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 기존 뷰 삭제
DROP VIEW IF EXISTS monthly_expense_summary CASCADE;
DROP VIEW IF EXISTS category_expense_summary CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS set_default_user_id() CASCADE;

-- 1. users 테이블 (간소화된 버전, 실제 auth 없이 사용)
CREATE TABLE users (
  id UUID DEFAULT '00000000-0000-0000-0000-000000000001' PRIMARY KEY,
  name VARCHAR(100) DEFAULT '기본 사용자',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 사용자 데이터 삽입
INSERT INTO users (id, name) VALUES 
('00000000-0000-0000-0000-000000000001', '기본 사용자');

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
  user_id UUID DEFAULT '00000000-0000-0000-0000-000000000001' REFERENCES users(id) ON DELETE CASCADE,
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

-- 6. RLS (Row Level Security) 정책 설정 - 모든 사용자 접근 허용
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- users 테이블: 모든 사용자가 읽기/쓰기 가능
CREATE POLICY "Public users access" ON users
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- expenses 테이블: 모든 사용자가 모든 작업 가능 (인증 불필요)
CREATE POLICY "Public expenses access" ON expenses
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- categories 테이블: 모든 사용자가 읽기 가능
CREATE POLICY "Public categories read" ON categories
  FOR SELECT 
  USING (true);

-- 7. user_id 자동 설정 함수
CREATE OR REPLACE FUNCTION set_default_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- 고정된 UUID 사용 (기본 사용자)
  IF NEW.user_id IS NULL THEN
    NEW.user_id = '00000000-0000-0000-0000-000000000001';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. expenses 테이블에 user_id 자동 설정 트리거
CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION set_default_user_id();

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

-- 11. 유용한 뷰 생성 (수정된 버전)
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

-- 12. 데이터 확인용 뷰 (개발/디버깅용)
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
ORDER BY e.expense_date DESC, e.created_at DESC;

-- 스키마 생성 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '=================================';
  RAISE NOTICE 'MoneyTrack 스키마 v1.1 생성 완료!';
  RAISE NOTICE '- 인증 없이 사용 가능';
  RAISE NOTICE '- 모든 지출이 기본 사용자로 저장';
  RAISE NOTICE '- Public access RLS 정책 적용';
  RAISE NOTICE '=================================';
END
$$; 