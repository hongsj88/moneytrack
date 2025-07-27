import React, { useState } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Calendar, 
  Utensils, 
  Car, 
  ShoppingCart, 
  MoreHorizontal,
  Heart,
  BookOpen,
  Gamepad2,
  Home
} from 'lucide-react'

const iconMap = {
  Utensils,
  Car,
  ShoppingCart,
  MoreHorizontal,
  Heart,
  BookOpen,
  Gamepad2,
  Home
}

function ExpenseList({ expenses, onDeleteExpense, currentMonth, onMonthChange }) {
  const [deletingId, setDeletingId] = useState(null)

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

  // 날짜 포맷팅
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    
    return `${month}/${day} (${dayOfWeek})`
  }

  // 월 표시 포맷팅
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01')
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  // 지출 삭제 처리
  const handleDelete = async (id) => {
    if (!confirm('이 지출을 삭제하시겠습니까?')) return
    
    setDeletingId(id)
    const success = await onDeleteExpense(id)
    
    if (!success) {
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
    
    setDeletingId(null)
  }

  // 색상 맵핑
  const getBgColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-50 border-orange-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      red: 'bg-red-50 border-red-200',
      green: 'bg-green-50 border-green-200',
      pink: 'bg-pink-50 border-pink-200',
      brown: 'bg-amber-50 border-amber-200',
      gray: 'bg-gray-50 border-gray-200'
    }
    return colors[color] || colors.gray
  }

  const getTextColorClass = (color) => {
    const colors = {
      orange: 'text-orange-700',
      blue: 'text-blue-700',
      purple: 'text-purple-700',
      red: 'text-red-700',
      green: 'text-green-700',
      pink: 'text-pink-700',
      brown: 'text-amber-700',
      gray: 'text-gray-700'
    }
    return colors[color] || colors.gray
  }

  // 날짜별로 그룹화
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.expense_date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(expense)
    return groups
  }, {})

  // 날짜순으로 정렬
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => new Date(b) - new Date(a))

  // 월별 총액 계산
  const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)

  return (
    <div className="space-y-6">
      {/* 월 선택 헤더 */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => changeMonth('prev')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{formatMonth(currentMonth)}</h2>
            <p className="text-sm text-gray-500">지출 내역</p>
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

        {/* 월별 요약 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">이번 달 총 지출</p>
            <p className="text-xl font-bold text-gray-900">
              {formatNumber(totalAmount)}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">지출 건수</p>
            <p className="text-xl font-bold text-gray-900">
              {expenses.length}건
            </p>
          </div>
        </div>
      </div>

      {/* 지출 내역 리스트 */}
      {expenses.length === 0 ? (
        <div className="card text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">지출 내역이 없습니다</h3>
          <p className="text-gray-600">이번 달에 등록된 지출이 없어요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => (
            <div key={date} className="card">
              {/* 날짜 헤더 */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {formatDate(date)}
                </h3>
                <p className="text-sm text-gray-600">
                  {groupedExpenses[date].reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toLocaleString()}원
                </p>
              </div>

              {/* 해당 날짜의 지출 리스트 */}
              <div className="space-y-3">
                {groupedExpenses[date].map(expense => {
                  const category = expense.categories
                  const Icon = iconMap[category?.icon] || MoreHorizontal
                  const isDeleting = deletingId === expense.id
                  
                  return (
                    <div
                      key={expense.id}
                      className={`
                        flex items-center justify-between p-3 rounded-lg border transition-all duration-200
                        ${isDeleting ? 'opacity-50' : 'opacity-100'}
                        ${category ? getBgColorClass(category.color) : 'bg-gray-50 border-gray-200'}
                      `}
                    >
                      <div className="flex items-center flex-1">
                        <div className={`
                          inline-flex items-center justify-center w-10 h-10 rounded-lg mr-3
                          ${category ? 'bg-white' : 'bg-gray-100'}
                        `}>
                          <Icon 
                            size={18} 
                            className={category ? getTextColorClass(category.color) : 'text-gray-600'} 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {category?.name || '기타'}
                          </h4>
                          {expense.memo && (
                            <p className="text-sm text-gray-600 mt-1">
                              {expense.memo}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <p className="font-bold text-gray-900">
                          {formatNumber(expense.amount)}원
                        </p>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          disabled={isDeleting}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExpenseList 