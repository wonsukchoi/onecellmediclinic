import React, { useState } from 'react'
import { useForm } from '../../hooks/useForm'
import { DatabaseService } from '../../services/supabase'
import styles from './ContactForm.module.css'
import type { ContactFormData } from '../../types'

const initialValues: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  message: '',
  preferredContact: 'email'
}

const validateForm = (values: ContactFormData) => {
  const errors: Partial<Record<keyof ContactFormData, string>> = {}

  if (!values.name.trim()) {
    errors.name = '이름을 입력해주세요.'
  }

  if (!values.email.trim()) {
    errors.email = '이메일을 입력해주세요.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = '올바른 이메일 형식이 아닙니다.'
  }

  if (!values.phone.trim()) {
    errors.phone = '연락처를 입력해주세요.'
  } else if (!/^[\d\-+()\s]+$/.test(values.phone)) {
    errors.phone = '올바른 연락처 형식이 아닙니다.'
  }

  if (!values.serviceType.trim()) {
    errors.serviceType = '상담 분야를 선택해주세요.'
  }

  if (!values.message.trim()) {
    errors.message = '문의 내용을 입력해주세요.'
  }

  return errors
}

const ContactForm: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  } = useForm(initialValues, validateForm)

  const onSubmit = async (formData: ContactFormData) => {
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const result = await DatabaseService.submitContactForm(formData)

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage('문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.')
        reset()
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || '문의 접수 중 오류가 발생했습니다.')
      }
    } catch {
      setSubmitStatus('error')
      setSubmitMessage('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const getInputClass = (fieldName: keyof ContactFormData) => {
    const baseClass = styles.formInput
    const hasError = touched[fieldName] && errors[fieldName]
    return hasError ? `${baseClass} ${styles.error}` : baseClass
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.formTitle}>상담 문의</h2>
      <p className={styles.formDescription}>
        궁금한 사항이 있으시면 언제든지 문의해 주세요.
      </p>

      {submitStatus === 'success' && (
        <div className={styles.successMessage}>
          {submitMessage}
        </div>
      )}

      {submitStatus === 'error' && (
        <div className={styles.errorAlert}>
          {submitMessage}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.formLabel}>
          이름 *
        </label>
        <input
          type="text"
          id="name"
          className={getInputClass('name')}
          value={values.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="이름을 입력해주세요"
        />
        {touched.name && errors.name && (
          <div className={styles.errorMessage}>{errors.name}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.formLabel}>
          이메일 *
        </label>
        <input
          type="email"
          id="email"
          className={getInputClass('email')}
          value={values.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="이메일을 입력해주세요"
        />
        {touched.email && errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.formLabel}>
          연락처 *
        </label>
        <input
          type="tel"
          id="phone"
          className={getInputClass('phone')}
          value={values.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="연락처를 입력해주세요"
        />
        {touched.phone && errors.phone && (
          <div className={styles.errorMessage}>{errors.phone}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="serviceType" className={styles.formLabel}>
          상담 분야 *
        </label>
        <select
          id="serviceType"
          className={`${styles.formSelect} ${touched.serviceType && errors.serviceType ? styles.error : ''}`}
          value={values.serviceType || ''}
          onChange={(e) => handleChange('serviceType', e.target.value)}
        >
          <option value="">상담 분야를 선택해주세요</option>
          <option value="plastic-surgery">성형외과</option>
          <option value="dermatology">피부과</option>
          <option value="aesthetic">미용/시술</option>
          <option value="consultation">일반 상담</option>
        </select>
        {touched.serviceType && errors.serviceType && (
          <div className={styles.errorMessage}>{errors.serviceType}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>
          연락 희망 방법 *
        </label>
        <div className={styles.radioGroup}>
          <div className={styles.radioOption}>
            <input
              type="radio"
              id="contact-email"
              name="preferredContact"
              value="email"
              className={styles.radioInput}
              checked={values.preferredContact === 'email'}
              onChange={(e) => handleChange('preferredContact', e.target.value as 'email' | 'phone')}
            />
            <label htmlFor="contact-email" className={styles.radioLabel}>
              이메일
            </label>
          </div>
          <div className={styles.radioOption}>
            <input
              type="radio"
              id="contact-phone"
              name="preferredContact"
              value="phone"
              className={styles.radioInput}
              checked={values.preferredContact === 'phone'}
              onChange={(e) => handleChange('preferredContact', e.target.value as 'email' | 'phone')}
            />
            <label htmlFor="contact-phone" className={styles.radioLabel}>
              전화
            </label>
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="message" className={styles.formLabel}>
          문의 내용 *
        </label>
        <textarea
          id="message"
          className={`${styles.formTextarea} ${touched.message && errors.message ? styles.error : ''}`}
          value={values.message || ''}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="문의 내용을 자세히 입력해주세요"
          rows={5}
        />
        {touched.message && errors.message && (
          <div className={styles.errorMessage}>{errors.message}</div>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? '문의 접수 중...' : '문의하기'}
      </button>
    </form>
  )
}

export default ContactForm