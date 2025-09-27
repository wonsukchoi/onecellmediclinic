import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Icon } from '../../components/icons';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: Location;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, signIn } = useAdmin();
  const location = useLocation();
  const state = location.state as LocationState;

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = state?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다');
      }
      // If successful, the useAdmin context will handle the redirect
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <Icon name="medical" size="xl" />
            </div>
            <h1 className={styles.logoText}>원셀 관리자</h1>
          </div>
          <p className={styles.subtitle}>클리닉 관리를 위해 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일 주소
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="admin@onecellclinic.co.kr"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.helpText}>
            관리자 전용 접근입니다. 접근이 필요하시면 시스템 관리자에게 문의하세요.
          </p>
        </div>
      </div>

      <div className={styles.backgroundPattern}></div>
    </div>
  );
};

export default LoginPage;