import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MemberService } from '../../services/member.service';
import type { MemberSignupFormData } from '../../types';
import styles from './MemberSignupPage.module.css';

const MemberSignupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<MemberSignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    agreeToTerms: false,
    agreeToPrivacy: false,
    agreeToMarketing: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

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

    const checkUser = async () => {
      const result = await MemberService.getCurrentMember();
      if (result.success && result.data) {
        navigate('/member/mypage', { replace: true });
      }
    };
    checkUser();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('member.email_required');
    } else if (!formData.email.includes('@')) {
      newErrors.email = t('member.email_format_invalid');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('member.password_required');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.password_min_length');
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t('validation.password_complexity_required');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.password_mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.name_required');
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t('validation.name_min_length');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('validation.phone_required');
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = t('validation.invalid_phone');
    }

    if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = t('validation.invalid_birth_date');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('validation.terms_agreement_required');
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = t('validation.privacy_agreement_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    }

    if (isValid && step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setLoading(true);

    try {
      const result = await MemberService.signUp(formData);

      if (result.success) {
        // Show success message and redirect to email verification page
        navigate('/member/verify-email', {
          state: {
            email: formData.email,
            message: t('member.signup_complete_message')
          }
        });
      } else {
        // Handle specific error messages
        const errorMessage = result.error;
        if (errorMessage?.includes('User already registered')) {
          setErrors({ email: t('member.email_already_exists') });
          setStep(1);
        } else if (errorMessage?.includes('Password should be at least')) {
          setErrors({ password: t('member.password_too_weak') });
          setStep(1);
        } else {
          setErrors({ general: errorMessage || t('member.signup_general_error') });
        }
      }
    } catch (error) {
      setErrors({ general: t('member.signup_retry_error') });
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  const renderStep1 = () => (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>{t('member.account_info_step')}</h2>
      <p className={styles.stepDescription}>{t('member.account_info_description')}</p>

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          {t('member.email_address')} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="example@email.com"
          className={`${styles.input} ${errors.email ? styles.error : ''}`}
          required
        />
        {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>
          {t('member.password')} *
        </label>
        <div className={styles.passwordInputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={t('member.password_requirements')}
            className={`${styles.input} ${errors.password ? styles.error : ''}`}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          {t('member.confirm_password')} *
        </label>
        <div className={styles.passwordInputWrapper}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder={t('member.confirm_password_placeholder')}
            className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.confirmPassword && <span className={styles.errorMessage}>{errors.confirmPassword}</span>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>{t('member.personal_info_step')}</h2>
      <p className={styles.stepDescription}>{t('member.personal_info_description')}</p>

      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          {t('member.name_label')} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t('member.name_placeholder')}
          className={`${styles.input} ${errors.name ? styles.error : ''}`}
          required
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="phone" className={styles.label}>
          {t('member.phone_label')} *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          className={`${styles.input} ${errors.phone ? styles.error : ''}`}
          required
        />
        {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label htmlFor="dateOfBirth" className={styles.label}>
            {t('member.birth_date_label')}
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`${styles.input} ${errors.dateOfBirth ? styles.error : ''}`}
          />
          {errors.dateOfBirth && <span className={styles.errorMessage}>{errors.dateOfBirth}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="gender" className={styles.label}>
            {t('member.gender_label')}
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="">{t('member.gender_select_placeholder')}</option>
            <option value="male">{t('member.gender_male')}</option>
            <option value="female">{t('member.gender_female')}</option>
            <option value="other">{t('member.gender_other')}</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>{t('member.terms_agreement_step')}</h2>
      <p className={styles.stepDescription}>{t('member.terms_agreement_description')}</p>

      <div className={styles.agreementSection}>
        <div className={`${styles.agreementItem} ${errors.agreeToTerms ? styles.error : ''}`}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              <strong>{t('member.terms_of_service')}</strong>{t('member.terms_agree_required')}
            </span>
          </label>
          <button type="button" className={styles.viewTermsButton}>
            {t('member.view_terms')}
          </button>
        </div>
        {errors.agreeToTerms && <span className={styles.errorMessage}>{errors.agreeToTerms}</span>}

        <div className={`${styles.agreementItem} ${errors.agreeToPrivacy ? styles.error : ''}`}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              <strong>{t('member.privacy_policy')}</strong>{t('member.privacy_policy_agree')}
            </span>
          </label>
          <button type="button" className={styles.viewTermsButton}>
            {t('member.view_terms')}
          </button>
        </div>
        {errors.agreeToPrivacy && <span className={styles.errorMessage}>{errors.agreeToPrivacy}</span>}

        <div className={styles.agreementItem}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="agreeToMarketing"
              checked={formData.agreeToMarketing}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <span className={styles.checkboxText}>
              {t('member.marketing_agree')}
            </span>
          </label>
        </div>
      </div>

      <div className={styles.marketingInfo}>
        <p>{t('member.marketing_benefits_description')}</p>
        <ul>
          <li>{t('member.marketing_benefit_events')}</li>
          <li>{t('member.marketing_benefit_procedures')}</li>
          <li>{t('member.marketing_benefit_health_tips')}</li>
          <li>{t('member.marketing_benefit_notifications')}</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.header}>
          <img
            src="/images/logo-dark.png"
            alt={t('header.logo_alt')}
            className={styles.logo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
          <h1 className={styles.title}>{t('member.signup_page_title')}</h1>

          {/* Progress indicator */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressSteps}>
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`${styles.progressStep} ${stepNum <= step ? styles.active : ''} ${stepNum < step ? styles.completed : ''}`}
                >
                  <span className={styles.stepNumber}>{stepNum}</span>
                  <span className={styles.stepLabel}>
                    {stepNum === 1 ? t('member.step_account_info') : stepNum === 2 ? t('member.step_personal_info') : t('member.step_terms_agreement')}
                  </span>
                </div>
              ))}
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.signupForm}>
          {errors.general && (
            <div className={styles.errorAlert}>
              {errors.general}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className={styles.buttonGroup}>
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className={styles.prevButton}
              >
                {t('member.previous')}
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className={styles.nextButton}
              >
                {t('member.next')}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
              >
                {loading ? (
                  <>
                    <div className={styles.spinner}></div>
                    {t('member.signing_up')}
                  </>
                ) : (
                  t('member.complete_signup')
                )}
              </button>
            )}
          </div>
        </form>

        <div className={styles.loginPrompt}>
          <p>
            {t('member.already_member')}{' '}
            <Link to="/member/login" className={styles.loginLink}>
              {t('member.login_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberSignupPage;