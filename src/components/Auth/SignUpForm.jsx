import React, { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function SignUpForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)

  const { signUp, signInWithGoogle, signInWithKakao } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // name 속성을 실제 폼 필드명으로 변환
    const fieldMap = {
      'signup-name': 'name',
      'signup-email': 'email', 
      'signup-password': 'password',
      'signup-confirm-password': 'confirmPassword'
    }
    
    const fieldName = fieldMap[name] || name
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.')
      return false
    }

    if (!formData.email) {
      setError('이메일을 입력해주세요.')
      return false
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    console.log('🚀 회원가입 시작:', formData.email)

    const { data, error: signUpError } = await signUp(
      formData.email, 
      formData.password, 
      formData.name
    )

    if (signUpError) {
      console.error('❌ 회원가입 오류:', signUpError.message)
      if (signUpError.message.includes('User already registered')) {
        setError('이미 등록된 이메일입니다.')
      } else if (signUpError.message.includes('Password should be at least 6 characters')) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
      } else {
        setError(signUpError.message)
      }
    } else {
      console.log('✅ 회원가입 성공!')
      setUserEmail(formData.email)
      setShowEmailModal(true)
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
    }

    setIsLoading(false)
  }

  // 구글 가입 핸들러
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true)
    setError('')

    const { error: googleError } = await signInWithGoogle()

    if (googleError) {
      setError('구글 가입에 실패했습니다: ' + googleError.message)
      setIsGoogleLoading(false)
    }
    // 성공 시에는 페이지가 리다이렉션되므로 로딩 상태를 유지
  }

  // 카카오 가입 핸들러
  const handleKakaoSignUp = async () => {
    setIsKakaoLoading(true)
    setError('')

    const { error: kakaoError } = await signInWithKakao()

    if (kakaoError) {
      setError('카카오 가입에 실패했습니다: ' + kakaoError.message)
      setIsKakaoLoading(false)
    }
    // 성공 시에는 페이지가 리다이렉션되므로 로딩 상태를 유지
  }

  const handleCloseModal = () => {
    setShowEmailModal(false)
    setUserEmail('')
    // 모달 닫으면 로그인 화면으로 전환
    setTimeout(() => {
      onSwitchToLogin()
    }, 300)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* 이메일 인증 안내 모달 */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 relative animate-in zoom-in duration-300">
            {/* 모달 헤더 */}
            <div className="p-6 text-center border-b border-gray-200">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                🎉 회원가입 완료!
              </h2>
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-green-600">{userEmail}</span>으로<br />
                가입이 성공적으로 완료되었습니다.
              </p>
            </div>

            {/* 모달 본문 */}
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                  📧 이메일 인증이 필요합니다
                </h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    <span><strong>{userEmail}</strong> 받은편지함을 확인하세요</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    <span>스팸함도 꼭 확인해보세요</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    <span>"이메일 주소 확인" 링크를 클릭하세요</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium mr-2">4.</span>
                    <span>확인 완료 후 다시 로그인하세요</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700 text-center">
                  💡 <strong>이메일이 오지 않나요?</strong><br />
                  몇 분 후에 다시 확인해보거나 스팸함을 확인해주세요.
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCloseModal}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                확인했습니다
              </button>
            </div>

            {/* 닫기 버튼 */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-gray-600">MoneyTrack에서 가계부를 시작하세요</p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="signup-name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                className="input-field pl-10"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="signup-email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="input-field pl-10"
                autoComplete="new-email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="signup-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="최소 6자 이상"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="signup-confirm-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호 다시 입력"
                className="input-field pl-10 pr-10"
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary-500 hover:bg-primary-600 shadow-sm hover:shadow-md'
              }
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                회원가입 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus size={18} className="mr-2" />
                회원가입
              </div>
            )}
          </button>
        </form>

        {/* 구분선 */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">또는</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 구글 가입 버튼 */}
        <button
          onClick={handleGoogleSignUp}
          disabled={isLoading || isGoogleLoading || isKakaoLoading}
          className={`
            w-full mt-4 py-3 px-4 rounded-lg font-medium border-2 transition-all duration-200
            flex items-center justify-center space-x-3
            ${isLoading || isGoogleLoading || isKakaoLoading
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md'
            }
          `}
        >
          {isGoogleLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
              <span>구글 가입 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 가입하기</span>
            </>
          )}
        </button>

        {/* 카카오 가입 버튼 */}
        <button
          onClick={handleKakaoSignUp}
          disabled={isLoading || isGoogleLoading || isKakaoLoading}
          className={`
            w-full mt-3 py-3 px-4 rounded-lg font-medium transition-all duration-200
            flex items-center justify-center space-x-3
            ${isLoading || isGoogleLoading || isKakaoLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-sm hover:shadow-md'
            }
          `}
        >
          {isKakaoLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span>카카오 가입 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.5 0 10 3.58 10 8 0 2.38-1.19 4.5-3.13 6.12-.07.08-.15.13-.25.13-.04 0-.08-.01-.12-.02L12 21l-6.5-3.77c-.04.01-.08.02-.12.02-.1 0-.18-.05-.25-.13C3.19 15.5 2 13.38 2 11c0-4.42 4.5-8 10-8z"/>
              </svg>
              <span>카카오로 가입하기</span>
            </>
          )}
        </button>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium underline"
              disabled={isLoading}
            >
              로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpForm 