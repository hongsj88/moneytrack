-- ==========================================
-- MoneyTrack 개인 비용 관리 앱 
-- 최종 데이터베이스 스키마 (Final Version)
-- ==========================================
-- 
-- 기능:
-- ✅ Supabase Auth 인증 시스템 사용
-- ✅ 사용자별 데이터 완전 분리 (RLS)
-- ✅ 이메일/비밀번호 로그인/회원가입
-- ✅ 비밀번호 재설정 기능
-- ✅ 자동 사용자 프로필 생성
-- ✅ 성능 최적화 인덱스
-- ✅ 유용한 뷰 및 함수
-- 
-- 생성일: 2025년 1월 26일
-- ==========================================

-- ==========================================
-- 1. 기존 객체 정리 (Clean Slate)
-- ==========================================

-- 기존 뷰 삭제
DROP VIEW IF EXISTS monthly_expense_summary CASCADE;
DROP VIEW IF EXISTS category_expense_summary CASCADE;
DROP VIEW IF EXISTS expense_details CASCADE;
DROP VIEW IF EXISTS user_statistics CASCADE;
DROP VIEW IF EXISTS recent_expenses CASCADE;

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS set_default_user_id() CASCADE;
DROP FUNCTION IF EXISTS get_user_expense_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_expenses(UUID, DATE) CASCADE;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_users_updated_at ON users CASCADE;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses CASCADE;

-- 기존 테이블 삭제
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- 2. 테이블 생성
-- ==========================================

-- 2.1 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT users_name_length CHECK (LENGTH(TRIM(name)) >= 1),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2.2 카테고리 테이블 (모든 사용자 공통)
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약 조건
  CONSTRAINT categories_name_length CHECK (LENGTH(TRIM(name)) >= 1),
  CONSTRAINT categories_icon_length CHECK (LENGTH(TRIM(icon)) >= 1),
  CONSTRAINT categories_color_format CHECK (color ~* '^[a-z]+$')
);

-- 2.3 지출 테이블 (메인 데이터 - 사용자별 분리)
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL,
  expense_date DATE NOT NULL,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 제약 조건 (CURRENT_DATE 제거하여 IMMUTABLE 문제 해결)
  CONSTRAINT expenses_amount_positive CHECK (amount > 0),
  CONSTRAINT expenses_amount_reasonable CHECK (amount <= 999999999.99),
  CONSTRAINT expenses_date_reasonable CHECK (
    expense_date >= '2020-01-01' AND 
    expense_date <= '2030-12-31'
  ),
  CONSTRAINT expenses_memo_length CHECK (LENGTH(memo) <= 500)
);

-- ==========================================
-- 3. 기본 데이터 삽입
-- ==========================================

INSERT INTO categories (name, icon, color, sort_order) VALUES
('식비', 'Utensils', 'orange', 1),
('교통비', 'Car', 'blue', 2),
('쇼핑', 'ShoppingCart', 'purple', 3),
('의료/건강', 'Heart', 'red', 4),
('교육', 'BookOpen', 'green', 5),
('여가/오락', 'Gamepad2', 'pink', 6),
('주거/관리비', 'Home', 'brown', 7),
('기타', 'MoreHorizontal', 'gray', 8);

-- ==========================================
-- 4. 인덱스 생성 (성능 최적화)
-- ==========================================

-- 사용자 테이블 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 지출 테이블 인덱스 (가장 중요)
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category_id);
CREATE INDEX idx_expenses_date_range ON expenses(expense_date);
CREATE INDEX idx_expenses_amount ON expenses(amount);
CREATE INDEX idx_expenses_created_at ON expenses(created_at DESC);

-- 복합 인덱스 (자주 사용되는 쿼리 최적화)
CREATE INDEX idx_expenses_user_date_amount ON expenses(user_id, expense_date DESC, amount DESC);

-- 카테고리 테이블 인덱스
CREATE INDEX idx_categories_active ON categories(is_active, sort_order);

-- ==========================================
-- 5. RLS (Row Level Security) 정책 설정
-- ==========================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 5.1 사용자 테이블 정책 (본인 데이터만 접근)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5.2 지출 테이블 정책 (본인 지출만 접근)
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    amount > 0 AND
    amount <= 999999999.99
  );

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    amount > 0 AND
    amount <= 999999999.99
  );

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- 5.3 카테고리 테이블 정책 (모든 인증된 사용자가 읽기 가능)
CREATE POLICY "Authenticated users can view active categories" ON categories
  FOR SELECT USING (
    auth.role() = 'authenticated' AND is_active = true
  );

-- 관리자 정책 (서비스 역할만 카테고리 수정 가능)
CREATE POLICY "Service role can manage categories" ON categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ==========================================
-- 6. 함수 및 트리거 생성
-- ==========================================

-- 6.1 updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.2 새 사용자 자동 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name', 
      SPLIT_PART(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- 이미 존재하는 경우 무시
    RETURN NEW;
  WHEN OTHERS THEN
    -- 기타 오류는 무시하고 계속 진행
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 사용자 통계 함수
CREATE OR REPLACE FUNCTION get_user_expense_stats(user_uuid UUID)
RETURNS TABLE(
  total_expenses BIGINT,
  total_amount NUMERIC,
  avg_amount NUMERIC,
  this_month_amount NUMERIC,
  last_month_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_expenses,
    COALESCE(SUM(amount), 0) as total_amount,
    COALESCE(AVG(amount), 0) as avg_amount,
    COALESCE(SUM(CASE 
      WHEN DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE) 
      THEN amount ELSE 0 END), 0) as this_month_amount,
    COALESCE(SUM(CASE 
      WHEN DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') 
      THEN amount ELSE 0 END), 0) as last_month_amount
  FROM expenses 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.4 월별 지출 조회 함수
CREATE OR REPLACE FUNCTION get_monthly_expenses(user_uuid UUID, target_month DATE)
RETURNS TABLE(
  expense_id UUID,
  amount NUMERIC,
  expense_date DATE,
  memo TEXT,
  category_name TEXT,
  category_icon TEXT,
  category_color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.amount,
    e.expense_date,
    e.memo,
    c.name,
    c.icon,
    c.color
  FROM expenses e
  JOIN categories c ON e.category_id = c.id
  WHERE e.user_id = user_uuid
    AND DATE_TRUNC('month', e.expense_date) = DATE_TRUNC('month', target_month)
  ORDER BY e.expense_date DESC, e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 7. 트리거 설정
-- ==========================================

-- 7.1 Auth 사용자 생성 시 자동으로 users 테이블에 추가
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.2 updated_at 자동 업데이트 트리거
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 8. 유용한 뷰 생성
-- ==========================================

-- 8.1 월별 지출 요약 뷰
CREATE VIEW monthly_expense_summary AS
SELECT 
  e.user_id,
  DATE_TRUNC('month', e.expense_date)::DATE AS month,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount,
  AVG(e.amount) AS avg_amount,
  MIN(e.amount) AS min_amount,
  MAX(e.amount) AS max_amount,
  COUNT(DISTINCT e.category_id) AS category_count
FROM expenses e
WHERE e.user_id = auth.uid()
GROUP BY e.user_id, DATE_TRUNC('month', e.expense_date)
ORDER BY month DESC;

-- 8.2 카테고리별 지출 요약 뷰
CREATE VIEW category_expense_summary AS
SELECT 
  e.user_id,
  c.id AS category_id,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  COUNT(*) AS expense_count,
  SUM(e.amount) AS total_amount,
  AVG(e.amount) AS avg_amount,
  MAX(e.expense_date) AS last_expense_date
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = auth.uid()
GROUP BY e.user_id, c.id, c.name, c.icon, c.color
ORDER BY total_amount DESC;

-- 8.3 최근 지출 뷰 (30일)
CREATE VIEW recent_expenses AS
SELECT 
  e.id,
  e.amount,
  e.expense_date,
  e.memo,
  e.created_at,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = auth.uid()
  AND e.expense_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY e.expense_date DESC, e.created_at DESC
LIMIT 100;

-- 8.4 지출 상세 뷰 (가장 자주 사용)
CREATE VIEW expense_details AS
SELECT 
  e.id,
  e.amount,
  e.expense_date,
  e.memo,
  e.created_at,
  e.updated_at,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  -- 유용한 계산 필드
  EXTRACT(YEAR FROM e.expense_date) AS expense_year,
  EXTRACT(MONTH FROM e.expense_date) AS expense_month,
  TO_CHAR(e.expense_date, 'YYYY-MM') AS expense_month_text,
  CASE 
    WHEN e.expense_date = CURRENT_DATE THEN '오늘'
    WHEN e.expense_date = CURRENT_DATE - 1 THEN '어제'
    WHEN e.expense_date >= CURRENT_DATE - 7 THEN '이번 주'
    WHEN e.expense_date >= CURRENT_DATE - 30 THEN '이번 달'
    ELSE '이전'
  END AS relative_date
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = auth.uid()
ORDER BY e.expense_date DESC, e.created_at DESC;

-- 8.5 사용자 통계 뷰
CREATE VIEW user_statistics AS
SELECT 
  u.id AS user_id,
  u.name AS user_name,
  u.email,
  u.created_at AS user_since,
  COALESCE(stats.total_expenses, 0) AS total_expenses,
  COALESCE(stats.total_amount, 0) AS total_amount,
  COALESCE(stats.avg_amount, 0) AS avg_expense,
  COALESCE(stats.this_month_amount, 0) AS this_month_amount,
  COALESCE(stats.last_month_amount, 0) AS last_month_amount,
  CASE 
    WHEN stats.last_month_amount > 0 THEN
      ROUND(((stats.this_month_amount - stats.last_month_amount) / stats.last_month_amount * 100)::NUMERIC, 2)
    ELSE NULL
  END AS month_over_month_change_percent,
  recent.last_expense_date,
  recent.days_since_last_expense
FROM users u
LEFT JOIN LATERAL get_user_expense_stats(u.id) stats ON true
LEFT JOIN LATERAL (
  SELECT 
    MAX(expense_date) AS last_expense_date,
    CASE 
      WHEN MAX(expense_date) IS NOT NULL THEN 
        CURRENT_DATE - MAX(expense_date)
      ELSE NULL
    END AS days_since_last_expense
  FROM expenses 
  WHERE user_id = u.id
) recent ON true
WHERE u.id = auth.uid();

-- ==========================================
-- 9. 권한 설정
-- ==========================================

-- 인증된 사용자에게 필요한 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON categories TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON expenses TO authenticated;

-- 시퀀스 권한
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 뷰 권한
GRANT SELECT ON monthly_expense_summary TO authenticated;
GRANT SELECT ON category_expense_summary TO authenticated;  
GRANT SELECT ON recent_expenses TO authenticated;
GRANT SELECT ON expense_details TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;

-- 함수 실행 권한
GRANT EXECUTE ON FUNCTION get_user_expense_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_expenses(UUID, DATE) TO authenticated;

-- ==========================================
-- 테이블 통계 정보 업데이트
-- ==========================================

ANALYZE users;
ANALYZE categories;
ANALYZE expenses;

-- ==========================================
-- 스키마 설치 완료
-- ========================================== 