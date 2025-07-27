import React from 'react'
import { 
  Utensils, 
  Car, 
  ShoppingCart, 
  MoreHorizontal, 
  PieChart,
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

function ExpenseChart({ expenses, currentMonth }) {
  // 카테고리별 지출 집계
  const categoryStats = expenses.reduce((acc, expense) => {
    const category = expense.categories
    if (!category) return acc
    
    const key = category.name
    if (!acc[key]) {
      acc[key] = {
        name: category.name,
        icon: category.icon,
        color: category.color,
        amount: 0,
        count: 0
      }
    }
    
    acc[key].amount += parseFloat(expense.amount)
    acc[key].count += 1
    return acc
  }, {})

  const categoryList = Object.values(categoryStats).sort((a, b) => b.amount - a.amount)
  const totalAmount = categoryList.reduce((sum, cat) => sum + cat.amount, 0)

  // 숫자 포맷팅
  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(num))
  }

  // 월 표시 포맷팅
  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01')
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
  }

  // 색상 맵핑
  const getColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      pink: 'bg-pink-500',
      brown: 'bg-amber-600',
      gray: 'bg-gray-500'
    }
    return colors[color] || colors.gray
  }

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

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="card text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <PieChart size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">분석할 데이터가 없습니다</h3>
          <p className="text-gray-600">지출을 추가하면 카테고리별 분석을 확인할 수 있어요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{formatMonth(currentMonth)}</h2>
          <p className="text-sm text-gray-500">카테고리별 지출 분석</p>
        </div>

        {/* 총액 */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {formatNumber(totalAmount)}원
          </h3>
          <p className="text-gray-600">총 지출</p>
        </div>
      </div>

      {/* 카테고리별 상세 */}
      <div className="space-y-4">
        {categoryList.map((category, index) => {
          const percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0
          const Icon = iconMap[category.icon] || MoreHorizontal // 기본 아이콘으로 폴백
          
          return (
            <div key={category.name} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`
                    inline-flex items-center justify-center w-10 h-10 rounded-lg mr-3
                    ${getBgColorClass(category.color)}
                  `}>
                    {Icon && <Icon size={18} className={getTextColorClass(category.color)} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-600">{category.count}건</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    {formatNumber(category.amount)}원
                  </p>
                  <p className="text-sm text-gray-600">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getColorClass(category.color)}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 요약 정보 */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 달 지출 패턴</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">가장 많이 사용한 카테고리</span>
            <span className="font-semibold text-gray-900">
              {categoryList[0]?.name || '-'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">카테고리 개수</span>
            <span className="font-semibold text-gray-900">
              {categoryList.length}개
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">카테고리당 평균 지출</span>
            <span className="font-semibold text-gray-900">
              {formatNumber(totalAmount / categoryList.length)}원
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExpenseChart 