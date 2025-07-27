import React, { useState } from 'react'
import { LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      alert('로그아웃 중 오류가 발생했습니다.')
    }
  }

  const getUserName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자'
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 relative">
      <div className="max-w-lg mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 로고 및 타이틀 */}
          <div>
            <h1 className="text-xl font-bold text-gray-900">MoneyTrack</h1>
            <p className="text-sm text-gray-600">개인 비용 관리</p>
          </div>

          {/* 사용자 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {getUserName()}
              </span>
            </button>

            {/* 드롭다운 메뉴 */}
            {showUserMenu && (
              <>
                {/* 배경 오버레이 */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                ></div>
                
                {/* 메뉴 */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  {/* 사용자 정보 */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserName()}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* 메뉴 아이템들 */}
                  <div className="py-1">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={() => {
                        setShowUserMenu(false)
                        // TODO: 프로필 설정 페이지로 이동
                      }}
                    >
                      <Settings size={16} className="mr-3" />
                      계정 설정
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        handleSignOut()
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut size={16} className="mr-3" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 