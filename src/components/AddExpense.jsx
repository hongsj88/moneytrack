import React, { useState, useEffect } from 'react'
import { 
  Utensils, 
  Car, 
  ShoppingCart, 
  MoreHorizontal, 
  Check,
  Heart,
  BookOpen,
  Gamepad2,
  Home,
  CheckCircle,
  X,
  AlertCircle
} from 'lucide-react'
import { CATEGORIES } from '../lib/supabase'

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

function AddExpense({ onAddExpense, onSuccess }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })

  // 알림 표시 함수
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
  }

  // 알림 자동 숨김
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, type: '', message: '' })
      }, 3000) // 3초 후 자동 사라짐

      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCategory || !amount) {
      showNotification('error', '카테고리와 금액을 입력해주세요.')
      return
    }

    if (parseFloat(amount) <= 0) {
      showNotification('error', '올바른 금액을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    const expenseData = {
      category_id: selectedCategory.id,
      amount: parseFloat(amount),
      expense_date: date,
      memo: memo.trim() || null
    }

    const success = await onAddExpense(expenseData)
    
    if (success) {
      // 폼 초기화
      setSelectedCategory(null)
      setAmount('')
      setMemo('')
      setDate(new Date().toISOString().split('T')[0])
      
      // 성공 메시지 및 탭 전환
      showNotification('success', '지출이 등록되었습니다!')
      
      // 1초 후 탭 전환 (알림을 보여주기 위해 약간의 지연)
      setTimeout(() => {
        onSuccess()
      }, 1000)
    } else {
      showNotification('error', '지출 등록에 실패했습니다. 다시 시도해주세요.')
    }
    
    setIsSubmitting(false)
  }

  const getCategoryColor = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-600 border-orange-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      pink: 'bg-pink-100 text-pink-600 border-pink-200',
      brown: 'bg-amber-100 text-amber-600 border-amber-200',
      gray: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return colors[color] || colors.gray
  }

  return (
    <div className="relative space-y-6">
      {/* 토스트 알림 */}
      {notification.show && (
        <div className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 z-50 
          px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3
          transition-all duration-300 ease-in-out animate-in slide-in-from-top
          ${notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
          }
        `}>
          {notification.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification({ show: false, type: '', message: '' })}
            className="ml-2 text-white hover:text-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">새 지출 추가</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 날짜 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* 카테고리 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              카테고리
            </label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(category => {
                const Icon = iconMap[category.icon]
                const isSelected = selectedCategory?.id === category.id
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      flex items-center p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected 
                        ? `${getCategoryColor(category.color)} border-current shadow-sm scale-105` 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon size={20} className="mr-3" />
                    <span className="font-medium">{category.name}</span>
                    {isSelected && <Check size={16} className="ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 금액 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              금액
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="input-field pr-8 text-right text-lg font-semibold"
                min="0"
                step="1"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                원
              </span>
            </div>
          </div>

          {/* 메모 (선택사항) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 <span className="text-gray-400 text-xs">(선택사항)</span>
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: 스타벅스 아메리카노"
              className="input-field"
              maxLength="100"
            />
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={!selectedCategory || !amount || isSubmitting}
            className={`
              w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200
              ${selectedCategory && amount && !isSubmitting
                ? 'btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? '저장 중...' : '지출 추가하기'}
          </button>
        </form>
      </div>

      {/* 빠른 추가 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-1">💡 빠른 추가 팁</h3>
        <p className="text-xs text-blue-700">
          카테고리 → 금액 → 저장 3단계로 빠르게 지출을 기록하세요!
        </p>
      </div>
    </div>
  )
}

export default AddExpense 