import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MemberService } from '../../services/member.service';
import type { MemberPasswordResetFormData } from '../../types';
import styles from './ForgotPasswordPage.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [formData, setFormData] = useState<MemberPasswordResetFormData>({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await MemberService.resetPassword(formData.email);

      if (result.success) {
        setSuccess(true);
      } else {
        // Handle specific error messages
        const errorMessage = result.error;
        if (errorMessage?.includes('User not found')) {
          setError('등록되지 않은 이메일입니다. 이메일 주소를 확인해주세요.');
        } else {
          setError(errorMessage || '비밀번호 재설정 요청 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      setError('비밀번호 재설정 요청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!formData.email) return;

    setLoading(true);
    setError('');

    try {
      const result = await MemberService.resetPassword(formData.email);
      if (result.success) {
        setError('');
        // Show success feedback without changing success state
      } else {
        setError(result.error || '이메일 재발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('이메일 재발송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.resetContainer}>
        <div className={styles.resetCard}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <div className={styles.content}>
            <h1 className={styles.title}>이메일이 발송되었습니다</h1>
            <div className={styles.description}>
              <p>
                <strong>{formData.email}</strong>로 비밀번호 재설정 링크를 발송했습니다.
              </p>
              <p>
                이메일을 확인하고 링크를 클릭하여 새로운 비밀번호를 설정해주세요.
              </p>
            </div>

            <div className={styles.instructions}>
              <h3>이메일을 받지 못하셨나요?</h3>
              <ul>
                <li>스팸 폴더나 정크 메일함을 확인해보세요</li>
                <li>이메일 주소가 올바른지 확인해주세요</li>
                <li>몇 분 후에 다시 확인해보세요</li>
              </ul>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleResendEmail}
                disabled={loading}
                className={`${styles.resendButton} ${loading ? styles.loading : ''}`}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    재발송 중...
                  </>
                ) : (
                  '이메일 재발송'
                )}
              </button>

              <Link to="/member/login" className={styles.backButton}>
                로그인 페이지로 돌아가기
              </Link>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resetContainer}>
      <div className={styles.resetCard}>
        <div className={styles.logoSection}>
          <img
            src="/images/logo-dark.png"
            alt="원셀 메디클리닉"
            className={styles.logo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
          <h1 className={styles.title}>비밀번호 재설정</h1>
          <p className={styles.subtitle}>
            가입할 때 사용한 이메일 주소를 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.resetForm}>
          {error && (
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              이메일 주소
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@email.com"
              className={styles.input}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                전송 중...
              </>
            ) : (
              '비밀번호 재설정 이메일 발송'
            )}
          </button>
        </form>

        <div className={styles.backToLogin}>
          <p>
            비밀번호가 기억나셨나요?{' '}
            <Link to="/member/login" className={styles.loginLink}>
              로그인하기
            </Link>
          </p>
        </div>

        <div className={styles.helpLinks}>
          <Link to="/member/signup" className={styles.helpLink}>
            회원가입
          </Link>
          <span className={styles.linkDivider}>|</span>
          <Link to="/contact" className={styles.helpLink}>
            고객센터
          </Link>
          <span className={styles.linkDivider}>|</span>
          <Link to="/member/help" className={styles.helpLink}>
            도움말
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;