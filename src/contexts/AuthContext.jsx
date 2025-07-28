import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { checkAndMergeAccounts, showAccountMergeNotification } from '../lib/accountLinking'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accountMergeNotification, setAccountMergeNotification] = useState(null)
  const [isMergingAccounts, setIsMergingAccounts] = useState(false)
  const [processedUsers, setProcessedUsers] = useState(new Set()) // 이미 처리된 사용자 추적

  useEffect(() => {
    // 현재 세션 가져오기
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('세션 가져오기 오류:', error.message)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getSession()

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth 상태 변경:', event, session?.user?.email)
        
        // 소셜 로그인 시 계정 통합 체크 (무한 루프 방지)
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user
          const userKey = `${user.id}_${user.email}` // 사용자 고유 키
          
          // 이미 처리된 사용자인지 확인
          if (processedUsers.has(userKey)) {
            console.log('ℹ️ 이미 처리된 사용자, 계정 통합 체크 건너뜀')
          } else {
            // 소셜 로그인인지 확인 (OAuth provider 사용)
            const isSocialLogin = user.app_metadata?.providers?.length > 0 && 
                                 user.app_metadata.providers.some(provider => provider !== 'email')
            
            if (isSocialLogin && user.email) {
              console.log('🔗 소셜 로그인 감지, 계정 통합 체크 시작')
              setIsMergingAccounts(true)
              
              // 처리된 사용자로 추가
              setProcessedUsers(prev => new Set([...prev, userKey]))
              
              try {
                const { merged, targetUserId, error } = await checkAndMergeAccounts(user)
                
                if (error) {
                  console.error('❌ 계정 통합 체크 실패:', error)
                } else if (merged) {
                  console.log('✅ 계정 통합 완료, 알림 표시')
                  const notification = showAccountMergeNotification({ email: user.email })
                  setAccountMergeNotification(notification)
                  
                  // 5초 후 알림 자동 제거
                  setTimeout(() => {
                    setAccountMergeNotification(null)
                  }, notification.duration)
                }
              } catch (error) {
                console.error('💥 계정 통합 처리 중 오류:', error)
              } finally {
                setIsMergingAccounts(false)
              }
            }
          }
        }
        
        // 로그아웃 처리
        if (event === 'SIGNED_OUT') {
          console.log('🚪 Auth 상태: 로그아웃 감지')
          setProcessedUsers(new Set())
          setAccountMergeNotification(null)
          setIsMergingAccounts(false)
        }

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // 회원가입
  const signUp = async (email, password, name) => {
    try {
      setLoading(true)
      console.log('🔐 AuthContext signUp 시작:', { email, name })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })

      console.log('📋 Supabase signUp 응답:', { data, error })

      if (error) {
        console.error('❌ Supabase signUp 오류:', error)
        throw error
      }

      console.log('✅ AuthContext signUp 성공:', data)
      return { data, error: null }
    } catch (error) {
      console.error('💥 회원가입 오류:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 로그인
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      console.log('🔐 로그인 시도:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ 로그인 실패:', error)
        
        // 더 자세한 에러 정보 로깅
        console.log('에러 코드:', error.status)
        console.log('에러 메시지:', error.message)
        
        throw error
      }

      console.log('✅ 로그인 성공:', data.user?.email)
      return { data, error: null }
    } catch (error) {
      console.error('💥 로그인 오류:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 구글 로그인
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🔐 구글 로그인 시작')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('❌ 구글 로그인 오류:', error)
        throw error
      }

      console.log('✅ 구글 로그인 리다이렉션 시작:', data)
      return { data, error: null }
    } catch (error) {
      console.error('💥 구글 로그인 오류:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 카카오 로그인
  const signInWithKakao = async () => {
    try {
      setLoading(true)
      console.log('🟡 카카오 로그인 시작')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}`,
        }
      })

      if (error) {
        console.error('❌ 카카오 로그인 오류:', error)
        throw error
      }

      console.log('✅ 카카오 로그인 리다이렉션 시작:', data)
      return { data, error: null }
    } catch (error) {
      console.error('💥 카카오 로그인 오류:', error.message)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      setLoading(true)
      console.log('🚪 로그아웃 시작')
      
      // 상태 초기화
      setProcessedUsers(new Set())
      setAccountMergeNotification(null)
      setIsMergingAccounts(false)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      console.log('✅ 로그아웃 완료')
      return { error: null }
    } catch (error) {
      console.error('❌ 로그아웃 오류:', error.message)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // 비밀번호 재설정
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error.message)
      return { data: null, error }
    }
  }

  // 이메일 인증 재전송
  const resendConfirmation = async (email) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('이메일 인증 재전송 오류:', error.message)
      return { data: null, error }
    }
  }

  // 비밀번호 업데이트
  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('비밀번호 업데이트 오류:', error.message)
      return { data: null, error }
    }
  }

  // 프로필 업데이트
  const updateProfile = async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      })

      if (error) {
        throw error
      }

      // users 테이블도 업데이트
      if (user) {
        const { error: profileError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id)

        if (profileError) {
          console.error('프로필 업데이트 오류:', profileError.message)
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error.message)
      return { data: null, error }
    }
  }

  const value = {
    user,
    session,
    loading,
    isMergingAccounts,
    accountMergeNotification,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithKakao,
    signOut,
    resetPassword,
    resendConfirmation,
    updatePassword,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 