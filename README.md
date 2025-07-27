# 💰 MoneyTrack - 개인 비용 관리 앱

모바일 친화적인 개인 가계부 관리 웹 애플리케이션입니다. React와 Supabase를 사용하여 개발되었으며, 간편한 3단계 지출 기록과 시각적 분석 기능을 제공합니다.

## 📱 주요 기능

### ✨ 핵심 기능
- **간편한 지출 기록**: 카테고리 → 금액 → 저장 3단계로 빠른 입력
- **월별 지출 요약**: 총 지출, 평균, 카테고리별 통계 제공
- **카테고리별 분석**: 시각적 차트와 진행률 바로 지출 패턴 분석
- **지출 내역 관리**: 날짜별 그룹화된 내역 조회 및 삭제

### 🎨 사용자 경험
- **모바일 퍼스트**: 스마트폰 사용에 최적화된 반응형 UI
- **직관적인 네비게이션**: 하단 탭 방식의 간편한 이동
- **실시간 업데이트**: 즉시 반영되는 데이터 변경사항
- **깔끔한 디자인**: Tailwind CSS를 활용한 모던 인터페이스

## 🛠️ 기술 스택

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify 호환

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd MoneyTrack

# 의존성 설치
npm install
```

### 2. Supabase 설정

#### 2.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 대시보드에서 `Settings > API` 이동
3. `Project URL`과 `anon public` 키 복사

#### 2.2 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에 Supabase 정보 추가:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 2.3 데이터베이스 스키마 설정
1. Supabase 대시보드의 `SQL Editor` 이동
2. `database/schema.sql` 파일 내용을 복사하여 실행
3. 테이블과 정책이 정상적으로 생성되었는지 확인

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📁 프로젝트 구조

```
MoneyTrack/
├── src/
│   ├── components/           # React 컴포넌트
│   │   ├── AddExpense.jsx   # 지출 추가
│   │   ├── ExpenseChart.jsx # 카테고리별 분석
│   │   ├── ExpenseList.jsx  # 지출 내역
│   │   └── MonthlySummary.jsx # 월별 요약
│   ├── lib/
│   │   └── supabase.js      # Supabase 클라이언트 설정
│   ├── App.jsx              # 메인 앱 컴포넌트
│   ├── main.jsx             # 엔트리 포인트
│   └── index.css            # 전역 스타일
├── database/
│   └── schema.sql           # 데이터베이스 스키마
├── requirement/             # 프로젝트 요구사항 문서
└── public/                  # 정적 파일
```

## 💾 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보
- **categories**: 지출 카테고리 (식비, 교통비, 쇼핑, 기타)
- **expenses**: 지출 데이터 (금액, 날짜, 메모)

### 보안 설정
- Row Level Security (RLS) 적용
- 사용자별 데이터 접근 제한
- Supabase Auth와 연동된 인증

## 📱 사용 방법

### 1. 지출 추가
1. 하단 탭에서 "지출 추가" 선택
2. 날짜 확인 (기본값: 오늘)
3. 카테고리 선택 (식비, 교통비, 쇼핑, 기타)
4. 금액 입력
5. 메모 추가 (선택사항)
6. "지출 추가하기" 버튼 클릭

### 2. 월별 요약 확인
- "월별 요약" 탭에서 선택한 월의 총 지출, 건수, 평균 확인
- 좌우 화살표로 다른 월로 이동 가능

### 3. 지출 분석
- "분석" 탭에서 카테고리별 지출 비율과 금액 확인
- 진행률 바로 시각적 비교 가능

### 4. 내역 관리
- "내역" 탭에서 날짜별로 그룹화된 지출 확인
- 휴지통 아이콘 클릭으로 개별 지출 삭제

## 🎯 PRD 기반 구현 현황

### ✅ 완료된 기능
- [x] 3단계 지출 기록 (PRD 목표 달성)
- [x] 모바일 친화적 UI/UX
- [x] 월별 지출 요약 및 통계
- [x] 카테고리별 시각적 분석
- [x] 지출 내역 관리 (조회/삭제)
- [x] 반응형 디자인
- [x] 실시간 데이터 동기화

### 🔄 향후 확장 가능한 기능
- [ ] 사용자 인증 (로그인/회원가입)
- [ ] 지출 목표 설정 및 알림
- [ ] 월별 비교 분석
- [ ] 데이터 내보내기 (CSV/PDF)
- [ ] 카테고리 커스터마이징
- [ ] 반복 지출 템플릿
- [ ] 다크 모드

## 🚀 배포

### Vercel 배포
```bash
npm run build
```

빌드된 `dist` 폴더를 Vercel에 배포하거나, GitHub 연동으로 자동 배포 설정

### Netlify 배포
1. 빌드 명령어: `npm run build`
2. 배포 디렉토리: `dist`
3. 환경 변수에 Supabase 정보 추가

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

이슈나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

> **💡 팁**: 매일 지출을 기록하는 습관을 만들어 효과적인 가계부 관리를 시작해보세요! 