# 🔧 MoneyTrack Supabase 설정 가이드

이 문서는 MoneyTrack 앱을 위한 Supabase 백엔드 설정 방법을 단계별로 안내합니다.

## 📋 사전 준비사항

- [Supabase](https://supabase.com) 계정
- 프로젝트 소스 코드
- 기본적인 SQL 지식 (선택사항)

## 🚀 1단계: Supabase 프로젝트 생성

### 1.1 계정 생성 및 로그인
1. [Supabase](https://supabase.com)에 접속
2. "Start your project" 클릭
3. GitHub/Google 계정으로 가입 또는 로그인

### 1.2 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. Organization 선택 (개인 계정 사용 권장)
3. 프로젝트 정보 입력:
   - **Name**: `MoneyTrack` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (자동 생성 권장)
   - **Region**: `Seoul (ap-northeast-1)` (한국 사용자의 경우)
4. "Create new project" 클릭
5. 프로젝트 생성 완료까지 1-2분 대기

## ⚙️ 2단계: API 키 확인

### 2.1 프로젝트 설정 접근
1. 프로젝트 대시보드에서 좌측 사이드바의 "Settings" 클릭
2. "API" 메뉴 선택

### 2.2 필수 정보 복사
다음 정보를 메모장에 복사해두세요:

```
Project URL: https://your-project-id.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **주의**: `service_role` 키는 서버 사이드에서만 사용하며, 클라이언트에 노출하면 안됩니다.

## 🗄️ 3단계: 데이터베이스 스키마 설정

### 3.1 SQL Editor 접근
1. 좌측 사이드바에서 "SQL Editor" 클릭
2. "New query" 버튼 클릭

### 3.2 스키마 실행
1. `database/schema.sql` 파일의 전체 내용을 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭 (또는 Ctrl+Enter)

### 3.3 실행 결과 확인
성공시 다음과 같은 메시지가 표시됩니다:
```
Success. No rows returned
```

오류가 발생하면 스키마를 다시 확인하고 재실행하세요.

## 🔍 4단계: 테이블 생성 확인

### 4.1 Table Editor에서 확인
1. 좌측 사이드바에서 "Table Editor" 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `users`
   - `categories` (4개 기본 카테고리 포함)
   - `expenses`

### 4.2 카테고리 데이터 확인
`categories` 테이블을 클릭하여 다음 데이터가 있는지 확인:
- 식비 (orange, Utensils)
- 교통비 (blue, Car)
- 쇼핑 (purple, ShoppingCart)
- 기타 (gray, MoreHorizontal)

## 🔒 5단계: RLS 정책 확인

### 5.1 Authentication 설정
1. 좌측 사이드바에서 "Authentication" 클릭
2. "Settings" 탭에서 다음 설정 확인:
   - **Enable email confirmations**: 필요에 따라 설정
   - **Enable phone confirmations**: 일반적으로 비활성화

### 5.2 RLS 정책 확인
1. "SQL Editor"에서 다음 쿼리 실행:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

2. `users`와 `expenses` 테이블의 `rowsecurity`가 `t`(true)인지 확인

## 🌐 6단계: 환경 변수 설정

### 6.1 .env 파일 생성
프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 6.2 보안 주의사항
- `.env` 파일을 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- `anon` 키만 클라이언트에서 사용하세요
- 배포시에는 환경 변수로 설정하세요

## 🧪 7단계: 연결 테스트

### 7.1 개발 서버 실행
```bash
npm run dev
```

### 7.2 기능 테스트
1. 브라우저에서 `http://localhost:3000` 접속
2. "지출 추가" 탭에서 테스트 데이터 입력:
   - 카테고리: 식비
   - 금액: 5000
   - 메모: 테스트 커피
3. "지출 추가하기" 클릭
4. "내역" 탭에서 데이터가 표시되는지 확인

### 7.3 Supabase에서 데이터 확인
1. Supabase "Table Editor"에서 `expenses` 테이블 클릭
2. 방금 추가한 데이터가 표시되는지 확인

## 🚨 문제 해결

### 일반적인 오류와 해결방법

#### 1. "Invalid API key" 오류
```
해결방법:
1. .env 파일의 키 값 재확인
2. Supabase 대시보드에서 키 다시 복사
3. 개발 서버 재시작 (npm run dev)
```

#### 2. "Row Level Security" 오류
```
해결방법:
1. 스키마가 정상적으로 실행되었는지 확인
2. RLS 정책이 제대로 생성되었는지 SQL Editor에서 확인
3. 인증이 필요한 경우 Authentication 설정 확인
```

#### 3. "Relation does not exist" 오류
```
해결방법:
1. 테이블이 모두 생성되었는지 Table Editor에서 확인
2. 스키마 전체를 다시 실행
3. 테이블명 오타 확인
```

#### 4. CORS 오류
```
해결방법:
1. Supabase > Settings > API에서 URL 확인
2. localhost:3000이 허용된 도메인인지 확인
3. 브라우저 캐시 삭제 후 재시도
```

## 📈 성능 최적화

### 인덱스 최적화
스키마에서 자동으로 생성되는 인덱스:
- `idx_expenses_user_id`: 사용자별 지출 조회
- `idx_expenses_user_date`: 사용자별 날짜 조회
- `idx_expenses_expense_date`: 날짜별 집계

### 쿼리 최적화 팁
1. 월별 데이터 조회시 날짜 범위 제한
2. 필요한 컬럼만 선택하여 조회
3. 조인 쿼리 최소화

## 🔄 백업 및 복원

### 정기 백업 설정
1. Supabase > Settings > Database
2. "Point in Time Recovery" 활성화 (Pro 플랜 이상)
3. 정기적인 SQL 덤프 생성 권장

### 데이터 내보내기
```sql
-- 전체 지출 데이터 CSV 내보내기
COPY (
  SELECT e.*, c.name as category_name 
  FROM expenses e 
  JOIN categories c ON e.category_id = c.id
) TO '/tmp/expenses_backup.csv' WITH CSV HEADER;
```

---

## 📞 추가 지원

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase 커뮤니티](https://github.com/supabase/supabase/discussions)
- 프로젝트 이슈는 GitHub Issues에 등록

설정 과정에서 문제가 발생하면 언제든지 문의해주세요! 🙂 