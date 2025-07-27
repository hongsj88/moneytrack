import React, { useState } from 'react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'
import ResetPasswordForm from './ResetPasswordForm'

function AuthContainer() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'signup', 'reset'

  const switchToLogin = () => setCurrentView('login')
  const switchToSignUp = () => setCurrentView('signup')
  const switchToReset = () => setCurrentView('reset')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      {/* 로고/브랜딩 섹션 */}
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 왼쪽: 브랜딩 */}
          <div className="hidden lg:block">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
                💰 MoneyTrack
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                스마트한 개인 비용 관리의 시작
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">간편한 3단계 지출 기록</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">시각적 지출 분석 차트</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">월별 지출 요약 및 통계</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">모바일 친화적 디자인</span>
                </div>
              </div>

              {/* 데모 이미지나 일러스트레이션 자리 */}
              <div className="mt-12 p-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600">
                    당신의 지출 패턴을 한눈에 파악하고<br />
                    똑똑한 소비 습관을 만들어보세요
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 인증 폼 */}
          <div className="w-full">
            {/* 모바일에서만 보이는 로고 */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                💰 MoneyTrack
              </h1>
              <p className="text-gray-600">스마트한 개인 비용 관리</p>
            </div>

            {/* 현재 뷰에 따른 폼 렌더링 */}
            {currentView === 'login' && (
              <LoginForm 
                onSwitchToSignUp={switchToSignUp}
                onSwitchToReset={switchToReset}
              />
            )}
            
            {currentView === 'signup' && (
              <SignUpForm 
                onSwitchToLogin={switchToLogin}
              />
            )}
            
            {currentView === 'reset' && (
              <ResetPasswordForm 
                onSwitchToLogin={switchToLogin}
              />
            )}
          </div>
        </div>

        {/* 하단 푸터 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 MoneyTrack. 개인 비용 관리의 새로운 경험</p>
        </div>
      </div>
    </div>
  )
}

export default AuthContainer 