import React from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Target } from 'lucide-react'

function MonthlySummary({ expenses, currentMonth, onMonthChange }) {
  // 월별 통계 계산
  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
  const expenseCount = expenses.length
  const dailyAverage = expenseCount > 0 ? totalAmount / new Date(currentMonth + '-01').getDate() : 0
  
  // 가장 많이 사용한 카테고리
  const categoryStats = expenses.reduce((acc, expense) => {
    const categoryName = expense.categories?.name || '기타'
    acc[categoryName] = (acc[categoryName] || 0) + parseFloat(expense.amount)
    return acc
  }, {})
  
  const topCategory = Object.entries(categoryStats).sort((a, b) => b[1] - a[1])[0]
  
  // 월 변경 함수
  const changeMonth = (direction) => {
    const current = new Date(currentMonth + '-01')
    if (direction === 'prev') {
      current.setMonth(current.getMonth() - 1)
    } else {
      current.setMonth(current.getMonth() + 1)
    }
    onMonthChange(current.toISOString().slice(0, 7))
  }

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  // 월 표시 포맷팅
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01')
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  return (
    <div className="space-y-6">
      {/* 월 선택 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{formatMonth(currentMonth)}</h2>
            <p className="text-sm text-gray-500">지출 요약</p>
          </div>
          
          <button
            onClick={() => changeMonth('next')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={currentMonth >= new Date().toISOString().slice(0, 7)}
          >
            <ChevronRight size={20} className={
              currentMonth >= new Date().toISOString().slice(0, 7) 
                ? 'text-gray-300' 
                : 'text-gray-600'
            } />
          </button>
        </div>

        {/* 총 지출 금액 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-4">
            <TrendingUp size={32} className="text-primary-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">
            {formatNumber(totalAmount)}원
          </h3>
          <p className="text-gray-600">이번 달 총 지출</p>
        </div>
      </div>

      {/* 상세 통계 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 지출 건수 */}
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
            <Calendar size={20} className="text-orange-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-900">{expenseCount}</h4>
          <p className="text-sm text-gray-600">지출 건수</p>
        </div>

        {/* 일평균 지출 */}
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
            <Target size={20} className="text-purple-600" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">{formatNumber(dailyAverage)}</h4>
          <p className="text-sm text-gray-600">일평균 지출</p>
        </div>
      </div>

      {/* 최다 사용 카테고리 */}
      {topCategory && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">가장 많이 사용한 카테고리</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900">{topCategory[0]}</h4>
              <p className="text-sm text-gray-600">
                전체의 {Math.round((topCategory[1] / totalAmount) * 100)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(topCategory[1])}원
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 데이터가 없을 때 */}
      {expenses.length === 0 && (
        <div className="card text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">지출 내역이 없습니다</h3>
          <p className="text-gray-600 mb-6">이번 달에 등록된 지출이 없어요.</p>
          <button 
            onClick={() => {/* 지출 추가 탭으로 이동 */}}
            className="btn-primary"
          >
            첫 지출 추가하기
          </button>
        </div>
      )}
    </div>
  )
}

export default MonthlySummary 