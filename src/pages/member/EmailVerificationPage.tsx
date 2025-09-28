import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MemberService } from '../../services/member.service';
import styles from './EmailVerificationPage.module.css';

const EmailVerificationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const email = location.state?.email || '';
  const successMessage = location.state?.message || '';

  useEffect(() => {
    if (successMessage) {
      setMessage(successMessage);
    } else if (!email) {
      navigate('/member/signup', { replace: true });
    }
  }, [email, successMessage, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      setError('이메일 정보가 없습니다. 다시 회원가입을 진행해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await MemberService.resendVerificationEmail();
      if (result.success) {
        setMessage('인증 이메일이 다시 발송되었습니다. 이메일을 확인해주세요.');
      } else {
        setError(result.error || '이메일 재발송 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('이메일 재발송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        <div className={styles.iconSection}>
          <div className={styles.emailIcon}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>이메일 인증</h1>

          {message ? (
            <div className={styles.successMessage}>
              <svg className={styles.successIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p>{message}</p>
            </div>
          ) : (
            <div className={styles.description}>
              <h2>이메일을 확인해주세요</h2>
              <p>
                <strong>{email}</strong>로 인증 이메일을 발송했습니다.<br />
                이메일을 확인하고 인증 링크를 클릭하여 회원가입을 완료해주세요.
              </p>
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.instructions}>
            <h3>인증 이메일을 찾을 수 없나요?</h3>
            <ul>
              <li>스팸 폴더나 정크 메일함을 확인해보세요</li>
              <li>이메일 주소가 올바른지 확인해주세요</li>
              <li>몇 분 후에 다시 확인해보세요</li>
              <li>여전히 이메일을 받지 못했다면 아래 버튼을 클릭하여 재발송하세요</li>
            </ul>
          </div>

          <div className={styles.actionButtons}>
            <button
              onClick={handleResendVerification}
              disabled={loading || !email}
              className={`${styles.resendButton} ${loading ? styles.loading : ''}`}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  재발송 중...
                </>
              ) : (
                '인증 이메일 재발송'
              )}
            </button>

            <Link to="/member/login" className={styles.loginButton}>
              로그인 페이지로 이동
            </Link>
          </div>

          <div className={styles.helpSection}>
            <p>문제가 계속 발생하시나요?</p>
            <Link to="/contact" className={styles.contactLink}>
              고객센터 문의하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;