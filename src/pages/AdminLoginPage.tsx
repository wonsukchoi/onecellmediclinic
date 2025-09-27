import React, { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import type { AdminFormData } from '../types'
import styles from './AdminLoginPage.module.css'

export const AdminLoginPage: React.FC = () => {
  const { user, signIn, loading } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = location.state?.from?.pathname || '/admin'

  const { values, errors, handleChange, handleSubmit } = useForm<AdminFormData>(
    {
      email: '',
      password: ''
    },
    (values: AdminFormData) => {
      const errors: Partial<Record<keyof AdminFormData, string>> = {}

      if (!values.email) {
        errors.email = '이메일을 입력해주세요'
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = '올바른 이메일 형식이 아닙니다'
      }

      if (!values.password) {
        errors.password = '비밀번호를 입력해주세요'
      } else if (values.password.length < 6) {
        errors.password = '비밀번호는 최소 6자 이상이어야 합니다'
      }

      return errors
    }
  )

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user?.role === 'admin') {
      // Already an admin, redirect immediately
    }
  }, [user])

  if (user?.role === 'admin') {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (formData: AdminFormData) => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await signIn(formData.email, formData.password)

      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다')
        return
      }

      // Check if user has admin role after sign in
      // This will be handled by the auth context and redirect will happen via useEffect
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>관리자 로그인</h1>
          <p>OneCell Medi Clinic 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={errors.email ? styles.inputError : ''}
              placeholder="admin@onecellclinic.com"
              disabled={isSubmitting || loading}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={errors.password ? styles.inputError : ''}
              placeholder="••••••••"
              disabled={isSubmitting || loading}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || loading}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>관리자 계정이 필요하신가요? 시스템 관리자에게 문의하세요.</p>
        </div>
      </div>
    </div>
  )
}