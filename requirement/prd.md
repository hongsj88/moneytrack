# 개인 비용 관리 앱 PRD (Product Requirements Document)

**문서 버전**: 1.0  
**작성일**: 2025년 7월 27일  
**프로젝트명**: 개인 비용 관리 앱 (가계부 앱)

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [목표 및 목적](#목표-및-목적)  
3. [타겟 사용자](#타겟-사용자)
4. [핵심 기능](#핵심-기능)
5. [기술 스택](#기술-스택)
6. [데이터베이스 설계](#데이터베이스-설계)
7. [UI/UX 요구사항](#uiux-요구사항)
8. [성능 요구사항](#성능-요구사항)
9. [보안 요구사항](#보안-요구사항)
10. [개발 일정](#개발-일정)
11. [추후 확장 계획](#추후-확장-계획)

---

## 📝 프로젝트 개요

### 프로젝트 목적
개인의 일상적인 지출을 효율적으로 기록하고 분석할 수 있는 모바일 친화적인 웹 애플리케이션 개발

### 핵심 가치 제안
- **간편한 지출 기록**: 직관적인 UI로 빠른 지출 입력
- **시각적 분석**: 카테고리별 지출 패턴을 차트로 확인
- **월별 관리**: 월단위 지출 현황 및 추세 파악
- **모바일 최적화**: 언제 어디서나 편리한 사용

---

## 🎯 목표 및 목적

### 주요 목표
1. **사용자 편의성**: 3번의 터치로 지출 기록 완료
2. **데이터 시각화**: 직관적인 차트와 그래프 제공
3. **모바일 퍼스트**: 스마트폰 사용에 최적화된 UX
4. **데이터 보안**: 개인 재무 정보의 안전한 관리

### 성공 지표 (KPI)
- 일 평균 지출 기록 건수: 5건 이상
- 사용자 retention rate: 월 80% 이상
- 앱 로딩 시간: 3초 이내
- 모바일 사용성 점수: 90점 이상

---

## 👥 타겟 사용자

### 주요 사용자
- **연령대**: 20-40대
- **특징**: 스마트폰 활용도가 높고 개인 재무 관리에 관심
- **니즈**: 간편하고 직관적인 가계부 관리 도구

### 사용자 페르소나
**이름**: 김지민 (28세, 직장인)
- 매일 출퇴근하며 다양한 지출 발생
- 스마트폰으로 빠르게 기록하고 싶어함
- 월말에 지출 패턴 분석을 통해 절약 방안 모색
- 복잡한 기능보다는 심플하고 직관적인 도구 선호

---

## 🚀 핵심 기능

### 1. 지출 기록 (Core Feature)
**기능 설명**: 일상적인 지출 내역을 간편하게 기록

**세부 기능**:
- 날짜 선택 (기본값: 오늘)
- 카테고리 선택 (식비, 교통비, 쇼핑, 기타)
- 금액 입력 (숫자 키패드 최적화)
- 메모 추가 (선택사항)

**사용자 시나리오**:
1. 사용자가 커피를 구매한 후 앱을 실행
2. "지출 추가" 버튼 터치
3. 카테고리 "식비" 선택
4. 금액 "4500" 입력
5. 메모 "스타벅스 아메리카노" 입력
6. "추가하기" 버튼으로 저장 완료

### 2. 월별 지출 요약
**기능 설명**: 선택한 월의 총 지출 금액과 요약 정보 표시

**세부 기능**:
- 월별 총 지출 금액 표시
- 전월 대비 증감률 (추후 추가)
- 일평균 지출 금액
- 가장 많이 사용한 카테고리

### 3. 카테고리별 분석 차트
**기능 설명**: 지출 패턴을 시각적으로 분석할 수 있는 차트 제공

**세부 기능**:
- 카테고리별 지출 금액 및 비율
- 진행률 바 형태의 시각화
- 월별 필터링 기능
- 각 카테고리의 아이콘과 색상 구분

### 4. 지출 내역 관리
**기능 설명**: 등록된 지출 내역을 조회하고 관리

**세부 기능**:
- 월별 지출 내역 리스트
- 개별 지출 삭제 기능
- 날짜순 정렬
- 카테고리별 필터링 (추후 추가)

---

## 💻 기술 스택

### Frontend
- **Framework**: React 18+
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Build Tool**: Vite 또는 Create React App

### Backend & Database
- **BaaS**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (추후 활용)

### Deployment
- **Frontend**: Vercel 또는 Netlify
- **Database**: Supabase Cloud

### Development Tools
- **Version Control**: Git + GitHub
- **Package Manager**: npm 또는 yarn
- **Code Quality**: ESLint, Prettier

---

## 🗄️ 데이터베이스 설계

### 테이블 구조

#### 1. users 테이블
```sql
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. categories 테이블
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. expenses 테이블 (메인)
```sql
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
```

### 초기 데이터
```sql
INSERT INTO categories (name, icon, color) VALUES
('식비', 'Utensils', 'orange'),
('교통비', 'Car', 'blue'),
('쇼핑', 'ShoppingCart', 'purple'),
('기타', 'MoreHorizontal', 'gray');
```

### 인덱스 최적화
- `idx_expenses_user_id`: 사용자별 지출 조회
- `idx_expenses_user_date`: 사용자별 날짜 조회 (복합 인덱스)
- `idx_expenses_expense_date`: 날짜별 집계 쿼리 최적화

---

## 🎨 UI/UX 요구사항

### 디자인 원칙
1. **모바일 퍼스트**: 스마트폰 화면에 최적화
2. **미니멀 디자인**: 불필요한 요소 제거, 핵심 기능에 집중
3. **직관적 네비게이션**: 하단 탭 바로 쉬운 화면 이동
4. **시각적 구분**: 카테고리별 색상과 아이콘으로 구분

### 색상 시스템
- **Primary**: Blue (#3B82F6)
- **식비**: Orange (#F97316)  
- **교통비**: Blue (#3B82F6)
- **쇼핑**: Purple (#A855F7)
- **기타**: Gray (#6B7280)

### 반응형 설계
- **모바일**: 320px ~ 768px (우선순위)
- **태블릿**: 768px ~ 1024px
- **데스크톱**: 1024px 이상

### 접근성 (Accessibility)
- 충분한 색상 대비 (WCAG AA 기준)
- 터치 타겟 최소 44px
- 스크린 리더 호환성
- 키보드 네비게이션 지원

---

## ⚡ 성능 요구사항

### 로딩 성능
- **초기 로딩**: 3초 이내
- **페이지 전환**: 1초 이내
- **데이터 저장**: 2초 이내

### 데이터 처리
- **월별 지출 조회**: 500ms 이내
- **차트 렌더링**: 1초 이내
- **지출 추가**: 1초 이내

### 최적화 전략
- **이미지 최적화**: WebP 포맷 사용
- **코드 스플리팅**: 페이지별 번들 분리
- **캐싱**: 카테고리 데이터 로컬 캐싱
- **지연 로딩**: 차트 컴포넌트 lazy loading

---

## 🔒 보안 요구사항

### 인증 및 권한
- **사용자 인증**: Supabase Auth 사용
- **Row Level Security**: 사용자별 데이터 격리
- **JWT 토큰**: 안전한 세션 관리

### 데이터 보호
- **HTTPS**: 모든 통신 암호화
- **입력 검증**: 클라이언트/서버 양쪽 검증
- **SQL 인젝션 방지**: Parameterized query 사용

### 개인정보 보호
- **최소 정보 수집**: 필수 정보만 수집
- **데이터 익명화**: 분석용 데이터 익명화
- **백업 암호화**: 데이터베이스 백업 암호화

---

## 📅 개발 일정

### Phase 1: 기본 기능 구현 (4주)
**Week 1-2**:
- 프로젝트 셋업 및 기본 UI 구조
- Supabase 설정 및 데이터베이스 생성
- 사용자 인증 시스템 구현

**Week 3-4**:
- 지출 추가/조회 기능 구현
- 기본 UI 컴포넌트 개발
- 모바일 반응형 적용

### Phase 2: 고급 기능 (3주)
**Week 5-6**:
- 카테고리별 차트 구현
- 월별 필터링 기능
- 지출 삭제 기능

**Week 7**:
- 성능 최적화
- 버그 수정 및 테스트
- 배포 준비

### Phase 3: 배포 및 최적화 (1주)
**Week 8**:
- 프로덕션 배포
- 모니터링 설정
- 사용자 피드백 수집

---

## 🚀 추후 확장 계획

### 단기 확장 (3개월 내)
1. **예산 관리**: 카테고리별 월간 예산 설정
2. **지출 알림**: 예산 초과시 푸시 알림
3. **데이터 내보내기**: CSV/Excel 파일 다운로드
4. **다크 모드**: 사용자 테마 선택 기능

### 중기 확장 (6개월 내)
1. **반복 지출**: 정기적인 지출 자동 등록
2. **리포트**: 월간/연간 지출 리포트 생성
3. **태그 시스템**: 지출에 태그 추가하여 세분화
4. **사진 첨부**: 영수증 사진 첨부 기능

### 장기 확장 (1년 내)
1. **AI 분석**: 지출 패턴 분석 및 절약 제안
2. **다중 통화**: 해외 지출 관리
3. **가족 공유**: 가족 구성원과 지출 내역 공유
4. **API 연동**: 은행/카드사 API 연동 자동 입력

---

## 📊 성공 지표 측정

### 사용자 지표
- **DAU (Daily Active Users)**: 일일 활성 사용자
- **MAU (Monthly Active Users)**: 월간 활성 사용자
- **Retention Rate**: 사용자 유지율 (1일, 7일, 30일)

### 기능 지표
- **지출 기록 완료율**: 지출 추가 시작 대비 완료율
- **차트 조회율**: 사용자 중 차트 기능 사용 비율
- **평균 세션 시간**: 앱 사용 시간

### 기술 지표
- **응답 시간**: API 응답 속도
- **에러율**: 시스템 오류 발생률
- **가용성**: 서비스 가동 시간 (99.9% 목표)

---

## 📞 연락처 및 승인

**프로덕트 매니저**: [이름]  
**개발 리드**: [이름]  
**디자이너**: [이름]  

**최종 승인**: [날짜] [승인자]

---

**문서 히스토리**:
- v1.0 (2025.07.27): 초기 PRD 작성