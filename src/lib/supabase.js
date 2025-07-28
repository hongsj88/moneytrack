import { createClient } from '@supabase/supabase-js'

// 환경 변수 값 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수 검증 (배포 환경에서는 console.log 제거)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 확인해주세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 스키마에 따른 타입 정의
export const CATEGORIES = [
  { id: 1, name: '식비', icon: 'Utensils', color: 'orange' },
  { id: 2, name: '교통비', icon: 'Car', color: 'blue' },
  { id: 3, name: '쇼핑', icon: 'ShoppingCart', color: 'purple' },
  { id: 4, name: '의료/건강', icon: 'Heart', color: 'red' },
  { id: 5, name: '교육', icon: 'BookOpen', color: 'green' },
  { id: 6, name: '여가/오락', icon: 'Gamepad2', color: 'pink' },
  { id: 7, name: '주거/관리비', icon: 'Home', color: 'brown' },
  { id: 8, name: '기타', icon: 'MoreHorizontal', color: 'gray' }
] 