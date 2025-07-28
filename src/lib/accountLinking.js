import { supabase } from './supabase'

/**
 * 이메일 기반 계정 통합 관리
 */

// 동일한 이메일로 기존 사용자 찾기
export const findExistingUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      return { user: null, error }
    }

    return { user: data, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

// 사용자 데이터 통합 (지출 데이터 이전)
export const mergeUserData = async (fromUserId, toUserId) => {
  try {
    // 1. 지출 데이터 이전
    const { error: expensesError } = await supabase
      .from('expenses')
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId)

    if (expensesError) {
      return { success: false, error: expensesError }
    }

    // 2. 중복 사용자 프로필 삭제
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', fromUserId)

    if (deleteError) {
      // 지출 데이터는 이미 이전되었으므로 계속 진행
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error }
  }
}

// 소셜 로그인 후 계정 통합 체크
export const checkAndMergeAccounts = async (newUser) => {
  try {
    const { email, id: newUserId } = newUser
    
    if (!email) {
      return { merged: false, error: null }
    }

    // 기존 사용자 검색
    const { user: existingUser, error: searchError } = await findExistingUserByEmail(email)
    
    if (searchError) {
      return { merged: false, error: searchError }
    }

    // 기존 사용자가 없거나 같은 사용자면 통합 불필요
    if (!existingUser || existingUser.id === newUserId) {
      return { merged: false, error: null }
    }

    // 데이터 통합 실행
    const { success, error: mergeError } = await mergeUserData(newUserId, existingUser.id)
    
    if (!success) {
      return { merged: false, error: mergeError }
    }

    return { 
      merged: true, 
      targetUserId: existingUser.id,
      error: null 
    }
  } catch (error) {
    return { merged: false, error }
  }
}

// 사용자에게 계정 통합 알림
export const showAccountMergeNotification = (existingUser) => {
  return {
    type: 'success',
    title: '계정이 통합되었습니다! 🎉',
    message: `기존 ${existingUser.email} 계정의 모든 데이터가 연결되었습니다.`,
    duration: 5000
  }
} 