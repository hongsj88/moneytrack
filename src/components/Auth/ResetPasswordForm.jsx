import React, { useState } from 'react'
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function ResetPasswordForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { resetPassword } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('이메일을 입력해주세요.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    const { error: resetError } = await resetPassword(email)

    if (resetError) {
      if (resetError.message.includes('User not found')) {
        setError('해당 이메일로 등록된 계정이 없습니다.')
      } else {
        setError(resetError.message)
      }
    } else {
      setSuccess('비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.')
      setEmail('')
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 재설정</h1>
          <p className="text-gray-600">
            가입하신 이메일 주소를 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다
          </p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* 비밀번호 재설정 폼 */}
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

          {/* 재설정 링크 보내기 버튼 */}
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
                전송 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <RefreshCw size={18} className="mr-2" />
                재설정 링크 보내기
              </div>
            )}
          </button>
        </form>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={isLoading}
          >
            <ArrowLeft size={16} className="mr-1" />
            로그인으로 돌아가기
          </button>
        </div>

        {/* 추가 안내 */}
        {success && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-1">📧 이메일을 확인해주세요</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 스팸함도 확인해보세요</li>
              <li>• 링크는 24시간 동안 유효합니다</li>
              <li>• 이메일이 오지 않으면 다시 시도해주세요</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPasswordForm 