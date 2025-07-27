import React, { useState, useEffect } from 'react'
import { PlusCircle, BarChart3, List, Calendar, CheckCircle, X } from 'lucide-react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthContainer from './components/Auth/AuthContainer'
import Header from './components/Layout/Header'
import AddExpense from './components/AddExpense'
import ExpenseList from './components/ExpenseList'
import ExpenseChart from './components/ExpenseChart'
import MonthlySummary from './components/MonthlySummary'
import { supabase } from './lib/supabase'

// 메인 앱 컴포넌트 (인증된 사용자용)
function MainApp() {
  const [activeTab, setActiveTab] = useState('add')
  const [expenses, setExpenses] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7))
  const [loading, setLoading] = useState(true)
  
  const { user, accountMergeNotification, isMergingAccounts } = useAuth()

  // 지출 데이터 가져오기
  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          categories (name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })
      
      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('지출 데이터 가져오기 실패:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // 지출 추가
  const addExpense = async (expenseData) => {
    try {
      const dataWithUserId = {
        ...expenseData,
        user_id: user.id
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([dataWithUserId])
        .select(`
          *,
          categories (name, icon, color)
        `)
      
      if (error) throw error
      
      if (data && data[0]) {
        setExpenses(prev => [data[0], ...prev])
        return true
      }
    } catch (error) {
      console.error('지출 추가 실패:', error.message)
      return false
    }
  }

  // 지출 삭제
  const deleteExpense = async (id) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // 사용자 확인
      
      if (error) throw error
      
      setExpenses(prev => prev.filter(expense => expense.id !== id))
      return true
    } catch (error) {
      console.error('지출 삭제 실패:', error.message)
      return false
    }
  }

  useEffect(() => {
    if (user) {
      fetchExpenses()
    }
  }, [user])

  // 현재 월의 지출 필터링
  const currentMonthExpenses = expenses.filter(expense => 
    expense.expense_date.startsWith(currentMonth)
  )

  const tabs = [
    { id: 'add', label: '지출 추가', icon: PlusCircle },
    { id: 'summary', label: '월별 요약', icon: Calendar },
    { id: 'chart', label: '분석', icon: BarChart3 },
    { id: 'list', label: '내역', icon: List }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 계정 통합 진행 중 알림 */}
      {isMergingAccounts && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span className="font-medium">계정 데이터를 통합하는 중...</span>
        </div>
      )}

      {/* 계정 통합 완료 알림 */}
      {accountMergeNotification && (
        <div className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3
          transition-all duration-300 ease-in-out animate-in slide-in-from-top
          ${accountMergeNotification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
          }
        `}>
          <CheckCircle size={20} className="flex-shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-sm">{accountMergeNotification.title}</div>
            <div className="text-xs opacity-90">{accountMergeNotification.message}</div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {activeTab === 'add' && (
          <AddExpense 
            onAddExpense={addExpense}
            onSuccess={() => setActiveTab('list')}
          />
        )}
        
        {activeTab === 'summary' && (
          <MonthlySummary 
            expenses={currentMonthExpenses}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
        
        {activeTab === 'chart' && (
          <ExpenseChart 
            expenses={currentMonthExpenses}
            currentMonth={currentMonth}
          />
        )}
        
        {activeTab === 'list' && (
          <ExpenseList 
            expenses={currentMonthExpenses}
            onDeleteExpense={deleteExpense}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        )}
      </main>

      {/* 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-around py-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                    isActive 
                      ? 'text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

// 앱 컨테이너 (인증 상태 확인)
function AppContainer() {
  const { user, loading } = useAuth()

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 인증되지 않은 사용자 -> 로그인 화면
  if (!user) {
    return <AuthContainer />
  }

  // 인증된 사용자 -> 메인 앱
  return <MainApp />
}

// 최상위 App 컴포넌트
function App() {
  return (
    <AuthProvider>
      <AppContainer />
    </AuthProvider>
  )
}

export default App 