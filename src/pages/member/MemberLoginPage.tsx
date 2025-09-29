import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMember } from '../../contexts/MemberContext';
import type { MemberLoginFormData } from '../../types';
import MainLayout from '../../components/MainLayout/MainLayout';
import styles from './MemberLoginPage.module.css';

const MemberLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { member, signIn } = useMember();

  const [formData, setFormData] = useState<MemberLoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Check if user is already logged in and scroll to top
  useEffect(() => {
    // Reset scroll position when component mounts
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For Safari

    // Fallback with timeout
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);

    // Redirect if already logged in
    if (member) {
      const from = location.state?.from?.pathname || '/member/mypage';
      navigate(from, { replace: true });
    }
  }, [member, location.state?.from?.pathname, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError(t('member.email_required'));
      return false;
    }

    if (!formData.email.includes('@')) {
      setError(t('member.email_format_invalid'));
      return false;
    }

    if (!formData.password.trim()) {
      setError(t('member.password_required'));
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
      const result = await signIn(formData.email, formData.password, formData.rememberMe);

      if (result.success) {
        // Redirect to intended page or mypage
        const from = location.state?.from?.pathname || '/member/mypage';
        navigate(from, { replace: true });
      } else {
        // Handle specific error messages
        const errorMessage = result.error;
        if (errorMessage?.includes('Invalid login credentials')) {
          setError(t('member.invalid_credentials'));
        } else if (errorMessage?.includes('Email not confirmed')) {
          setError(t('member.email_not_verified'));
        } else {
          setError(errorMessage || t('member.login_general_error'));
        }
      }
    } catch (error) {
      setError(t('member.login_retry_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'kakao') => {
    // TODO: Implement social login
    setError(`${provider} ${t('member.social_login_coming_soon')}`);
  };

  return (
    <MainLayout>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <button 
            onClick={() => navigate(-1)} 
            className={styles.backButton}
          >
            ← 뒤로가기
          </button>
          <div className={styles.logoSection}>
            <h1 className={styles.title}>{t('member.login_page_title')}</h1>
            <p className={styles.subtitle}>{t('member.login_page_subtitle')}</p>
          </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
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
              {t('member.email_address')}
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

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              {t('member.password')}
            </label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('member.password_placeholder')}
                className={styles.input}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t('member.hide_password') : t('member.show_password')}
              >
                {showPassword ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.formOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{t('member.remember_me')}</span>
            </label>

            <Link to="/member/forgot-password" className={styles.forgotPassword}>
              {t('member.forgot_password_question')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                {t('member.logging_in')}
              </>
            ) : (
              t('member.login')
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>{t('member.or')}</span>
        </div>

        <div className={styles.socialLogin}>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className={`${styles.socialButton} ${styles.googleButton}`}
          >
            <svg className={styles.socialIcon} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('member.login_with_google')}
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className={`${styles.socialButton} ${styles.kakaoButton}`}
          >
            <svg className={styles.socialIcon} viewBox="0 0 24 24">
              <path fill="#3C1E1E" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
            </svg>
            {t('member.login_with_kakao')}
          </button>
        </div>

        <div className={styles.signupPrompt}>
          <p>
            {t('member.not_member_yet')}{' '}
            <Link to="/member/signup" className={styles.signupLink}>
              {t('member.signup_link')}
            </Link>
          </p>
        </div>

        <div className={styles.helpLinks}>
          <Link to="/member/help" className={styles.helpLink}>
            {t('member.help')}
          </Link>
          <span className={styles.linkDivider}>|</span>
          <Link to="/contact" className={styles.helpLink}>
            {t('member.customer_service')}
          </Link>
          <span className={styles.linkDivider}>|</span>
          <Link to="/privacy-policy" className={styles.helpLink}>
            {t('member.privacy_policy')}
          </Link>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default MemberLoginPage;