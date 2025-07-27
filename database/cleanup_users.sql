-- ==========================================
-- 사용자 데이터 완전 초기화 스크립트
-- ==========================================
-- 
-- 주의: 이 스크립트는 모든 사용자 데이터를 삭제합니다!
-- 개발/테스트 환경에서만 사용하세요.
--
-- 실행 순서:
-- 1. 지출 데이터 삭제
-- 2. 사용자 프로필 삭제  
-- 3. Auth 사용자 삭제
-- ==========================================

-- 1. 모든 지출 데이터 삭제
DELETE FROM expenses;

-- 2. 모든 사용자 프로필 삭제
DELETE FROM users;

-- 3. Auth 사용자 삭제 (이것이 가장 중요!)
DELETE FROM auth.users;

-- 4. 확인용 카운트
SELECT 
  'expenses' as table_name, 
  COUNT(*) as count 
FROM expenses
UNION ALL
SELECT 
  'users' as table_name, 
  COUNT(*) as count 
FROM users
UNION ALL
SELECT 
  'auth.users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'categories' as table_name, 
  COUNT(*) as count 
FROM categories;

-- ==========================================
-- 결과 확인:
-- - expenses: 0
-- - users: 0  
-- - auth.users: 0
-- - categories: 8 (기본 카테고리들)
-- ========================================== 