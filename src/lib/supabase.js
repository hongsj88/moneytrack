import { createClient } from '@supabase/supabase-js'

// 환경 변수 확인 및 디버깅
console.log('환경 변수 확인:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '***설정됨***' : '❌ 설정되지 않음')

// vite.config.js에서 정의된 환경 변수 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY


// 연결 정보 확인
console.log('Supabase 연결 정보:')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...')

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