# 🔐 구글 소셜 로그인 설정 가이드

MoneyTrack 앱에서 구글 소셜 로그인을 활성화하기 위한 단계별 설정 가이드입니다.

## 📋 **1단계: Google Cloud Console 설정**

### **1.1 Google Cloud Console 접속**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 구글 계정으로 로그인

### **1.2 프로젝트 생성/선택**
1. **상단 프로젝트 선택기** 클릭
2. **"새 프로젝트"** 클릭 또는 **기존 프로젝트 선택**
3. **프로젝트 이름**: `MoneyTrack` (또는 원하는 이름)
4. **만들기** 클릭

### **1.3 OAuth 동의 화면 설정**
1. **좌측 메뉴** → **APIs & Services** → **OAuth consent screen**
2. **User Type**: **External** 선택 → **만들기**
3. **필수 정보 입력**:
   - **앱 이름**: `MoneyTrack`
   - **사용자 지원 이메일**: 본인 이메일
   - **개발자 연락처 정보**: 본인 이메일
4. **저장 후 계속** 클릭
5. **범위(Scopes)** → **저장 후 계속**
6. **테스트 사용자** → **저장 후 계속**

### **1.4 OAuth 2.0 Client ID 생성**
1. **좌측 메뉴** → **APIs & Services** → **Credentials**
2. **+ 사용자 인증 정보 만들기** → **OAuth 2.0 클라이언트 ID**
3. **애플리케이션 유형**: **웹 애플리케이션**
4. **이름**: `MoneyTrack Web Client`
5. **승인된 리디렉션 URI**에 **추가**:
   ```
   https://gdovwhmcwjetbadiulpl.supabase.co/auth/v1/callback
   ```
   > ⚠️ **중요**: `gdovwhmcwjetbadiulpl`을 본인의 Supabase 프로젝트 ID로 변경하세요!

6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사해서 저장 📋

---

## 🔧 **2단계: Supabase 설정**

### **2.1 Supabase 대시보드 접속**
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. **MoneyTrack 프로젝트** 선택

### **2.2 Google OAuth 활성화**
1. **좌측 메뉴** → **Authentication** → **Providers**
2. **Google** 클릭
3. **Enable Google provider** ✅ 체크
4. **Google OAuth 정보 입력**:
   - **Client ID**: Google Cloud Console에서 복사한 클라이언트 ID
   - **Client Secret**: Google Cloud Console에서 복사한 클라이언트 보안 비밀번호
5. **Save** 클릭

### **2.3 Redirect URL 확인**
- **Redirect URL**이 다음과 같이 표시되는지 확인:
  ```
  https://gdovwhmcwjetbadiulpl.supabase.co/auth/v1/callback
  ```

---

## 🚀 **3단계: 테스트**

### **3.1 개발 서버 실행**
```bash
npm run dev
```

### **3.2 구글 로그인 테스트**
1. **로그인 페이지** 접속
2. **"Google로 로그인"** 버튼 클릭
3. **구글 계정 선택** 및 **권한 승인**
4. **앱으로 리다이렉션** 확인
5. **사용자 프로필 자동 생성** 확인

### **3.3 회원가입 테스트**
1. **회원가입 페이지** 접속
2. **"Google로 가입하기"** 버튼 클릭
3. **구글 계정 선택** 및 **권한 승인**
4. **자동 회원가입** 및 **로그인** 확인

---

## 🔍 **문제 해결**

### **자주 발생하는 오류들**

#### **1. "redirect_uri_mismatch" 오류**
```
Error 400: redirect_uri_mismatch
```
**해결 방법**:
- Google Cloud Console의 **승인된 리디렉션 URI**가 정확한지 확인
- Supabase 프로젝트 ID가 올바른지 확인
- URL에 `https://`가 포함되어 있는지 확인

#### **2. "Access blocked" 오류**
```
Access blocked: This app's request is invalid
```
**해결 방법**:
- OAuth 동의 화면이 올바르게 설정되었는지 확인
- 앱이 "게시" 상태인지 확인 (개발 중에는 테스트 사용자 추가)

#### **3. "Client ID가 유효하지 않음" 오류**
**해결 방법**:
- Supabase에서 입력한 Client ID가 정확한지 확인
- Google Cloud Console에서 생성한 Client ID 재확인

#### **4. 로그인 후 앱으로 돌아오지 않음**
**해결 방법**:
- 리다이렉트 URL 재확인
- 브라우저 캐시 삭제 후 재시도
- 다른 브라우저로 테스트

---

## 📱 **운영 환경 배포 시 주의사항**

### **도메인 추가**
운영 환경에 배포할 때는 **실제 도메인**도 추가해야 합니다:

**Google Cloud Console**:
```
https://your-domain.com/auth/callback
https://www.your-domain.com/auth/callback
```

**Supabase**:
- **Site URL**을 실제 도메인으로 변경
- **Additional Redirect URLs**에 도메인 추가

---

## ✅ **구현된 기능들**

### **자동화된 기능들**
- ✅ **구글 계정으로 로그인**
- ✅ **구글 계정으로 회원가입**
- ✅ **이메일과 이름 자동 가져오기**
- ✅ **처음 로그인 시 자동 회원가입**
- ✅ **사용자 프로필 자동 생성**
- ✅ **RLS 정책 자동 적용**

### **UI/UX 개선사항**
- ✅ **구글 브랜드 가이드라인 준수**
- ✅ **로딩 상태 표시**
- ✅ **에러 처리**
- ✅ **깔끔한 구분선**
- ✅ **반응형 디자인**

---

## 🎯 **완료!**

이제 사용자들은 **간편하게 구글 계정으로 로그인/가입**할 수 있습니다! 

**기존 이메일/비밀번호 로그인**과 **구글 소셜 로그인**을 모두 지원하여 사용자에게 더 많은 선택권을 제공합니다. 🎉 