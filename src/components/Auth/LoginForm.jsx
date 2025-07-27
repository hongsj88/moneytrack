import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function LoginForm({ onSwitchToSignUp, onSwitchToReset }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendSuccess, setResendSuccess] = useState('')

  const { signIn, signInWithGoogle, signInWithKakao, resendConfirmation } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    setResendSuccess('')

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      console.log('🔍 로그인 에러 상세:', signInError)
      
      if (signInError.message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다. 회원가입을 하셨다면 이메일 인증을 완료해주세요.')
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('이메일 인증이 필요합니다. 회원가입 시 받은 인증 이메일을 확인해주세요.')
      } else if (signInError.message.includes('User not found')) {
        setError('등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.')
      } else if (signInError.message.includes('Wrong password')) {
        setError('비밀번호가 올바르지 않습니다.')
      } else {
        setError(`로그인에 실패했습니다: ${signInError.message}`)
      }
    }

    setIsLoading(false)
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('이메일을 먼저 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    setResendSuccess('')

    const { error: resendError } = await resendConfirmation(email)

    if (resendError) {
      setError('인증 이메일 재전송에 실패했습니다: ' + resendError.message)
    } else {
      setResendSuccess('인증 이메일을 다시 보냈습니다! 이메일을 확인해주세요.')
    }

    setIsLoading(false)
  }

  // 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setError('')
    setResendSuccess('')

    const { error: googleError } = await signInWithGoogle()

    if (googleError) {
      setError('구글 로그인에 실패했습니다: ' + googleError.message)
      setIsGoogleLoading(false)
    }
    // 성공 시에는 페이지가 리다이렉션되므로 로딩 상태를 유지
  }

  // 카카오 로그인 핸들러
  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true)
    setError('')
    setResendSuccess('')

    const { error: kakaoError } = await signInWithKakao()

    if (kakaoError) {
      setError('카카오 로그인에 실패했습니다: ' + kakaoError.message)
      setIsKakaoLoading(false)
    }
    // 성공 시에는 페이지가 리다이렉션되므로 로딩 상태를 유지
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
          <p className="text-gray-600">MoneyTrack에 오신 것을 환영합니다</p>
        </div>

        {/* 성공 메시지 */}
        {resendSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{resendSuccess}</p>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            
            {/* 이메일 미확인 시 추가 안내 */}
            {error.includes('이메일 인증이 필요합니다') && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-medium text-yellow-900 mb-2">📧 이메일 인증 방법:</h3>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside mb-3">
                  <li>받은편지함에서 "이메일 주소 확인" 이메일을 찾으세요</li>
                  <li>스팸함도 확인해보세요</li>
                  <li>이메일의 "이메일 확인" 버튼을 클릭하세요</li>
                  <li>확인 완료 후 다시 로그인해주세요</li>
                </ul>
                
                {/* 이메일 재전송 버튼 */}
                <button
                  onClick={handleResendConfirmation}
                  disabled={isLoading || !email}
                  className="w-full py-2 px-3 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border border-yellow-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '전송 중...' : '인증 이메일 다시 보내기'}
                </button>
                
                <p className="text-xs text-yellow-600 mt-2">
                  💡 이메일 주소를 먼저 입력한 후 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="input-field pl-10"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="input-field pl-10 pr-10"
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

          {/* 로그인 버튼 */}
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
                로그인 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <LogIn size={18} className="mr-2" />
                로그인
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

        {/* 구글 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
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
              <span>구글 로그인 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 로그인</span>
            </>
          )}
        </button>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
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
              <span>카카오 로그인 중...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c5.5 0 10 3.58 10 8 0 2.38-1.19 4.5-3.13 6.12-.07.08-.15.13-.25.13-.04 0-.08-.01-.12-.02L12 21l-6.5-3.77c-.04.01-.08.02-.12.02-.1 0-.18-.05-.25-.13C3.19 15.5 2 13.38 2 11c0-4.42 4.5-8 10-8z"/>
              </svg>
              <span>카카오로 로그인</span>
            </>
          )}
        </button>

        {/* 하단 링크 */}
        <div className="mt-6 text-center space-y-3">
          <button
            onClick={onSwitchToReset}
            className="text-sm text-primary-600 hover:text-primary-700 underline"
            disabled={isLoading}
          >
            비밀번호를 잊으셨나요?
          </button>
          
          <div className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="text-primary-600 hover:text-primary-700 font-medium underline"
              disabled={isLoading}
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm 