import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MemberService } from '../../services/member.service';
import type { MemberSignupFormData } from '../../types';
import styles from './MemberSignupPage.module.css';

const MemberSignupPage: React.FC = () => {
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

  // Check if user is already logged in
  useEffect(() => {
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
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (formData.password.length < 8) {
      newErrors.password = '비밀번호는 최소 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '이름은 최소 2자 이상이어야 합니다.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '휴대폰 번호를 입력해주세요.';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = '올바른 휴대폰 번호를 입력해주세요.';
    }

    if (formData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = '올바른 생년월일을 입력해주세요. (YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = '이용약관에 동의해주세요.';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = '개인정보처리방침에 동의해주세요.';
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
            message: '회원가입이 완료되었습니다. 이메일을 확인하여 계정을 인증해주세요.'
          }
        });
      } else {
        // Handle specific error messages
        const errorMessage = result.error;
        if (errorMessage?.includes('User already registered')) {
          setErrors({ email: '이미 가입된 이메일입니다.' });
          setStep(1);
        } else if (errorMessage?.includes('Password should be at least')) {
          setErrors({ password: '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.' });
          setStep(1);
        } else {
          setErrors({ general: errorMessage || '회원가입 중 오류가 발생했습니다.' });
        }
      }
    } catch (error) {
      setErrors({ general: '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.' });
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
      <h2 className={styles.stepTitle}>계정 정보</h2>
      <p className={styles.stepDescription}>로그인에 사용할 이메일과 비밀번호를 입력해주세요</p>

      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>
          이메일 주소 *
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
          비밀번호 *
        </label>
        <div className={styles.passwordInputWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="8자 이상, 영문 + 숫자 조합"
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
          비밀번호 확인 *
        </label>
        <div className={styles.passwordInputWrapper}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="비밀번호를 다시 입력하세요"
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
      <h2 className={styles.stepTitle}>개인 정보</h2>
      <p className={styles.stepDescription}>원활한 진료를 위한 기본 정보를 입력해주세요</p>

      <div className={styles.inputGroup}>
        <label htmlFor="name" className={styles.label}>
          이름 *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="실명을 입력해주세요"
          className={`${styles.input} ${errors.name ? styles.error : ''}`}
          required
        />
        {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="phone" className={styles.label}>
          휴대폰 번호 *
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
            생년월일
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
            성별
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            className={styles.input}
          >
            <option value="">선택해주세요</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>약관 동의</h2>
      <p className={styles.stepDescription}>서비스 이용을 위한 약관에 동의해주세요</p>

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
              <strong>이용약관</strong>에 동의합니다 (필수)
            </span>
          </label>
          <button type="button" className={styles.viewTermsButton}>
            보기
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
              <strong>개인정보처리방침</strong>에 동의합니다 (필수)
            </span>
          </label>
          <button type="button" className={styles.viewTermsButton}>
            보기
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
              마케팅 정보 수신에 동의합니다 (선택)
            </span>
          </label>
        </div>
      </div>

      <div className={styles.marketingInfo}>
        <p>마케팅 정보 수신 동의 시, 다음과 같은 혜택을 받으실 수 있습니다:</p>
        <ul>
          <li>이벤트 및 프로모션 안내</li>
          <li>신규 시술 정보</li>
          <li>건강 관리 팁</li>
          <li>예약 알림 서비스</li>
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
            alt="원셀 메디클리닉"
            className={styles.logo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/logo.png';
            }}
          />
          <h1 className={styles.title}>회원가입</h1>

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
                    {stepNum === 1 ? '계정정보' : stepNum === 2 ? '개인정보' : '약관동의'}
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
                이전
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className={styles.nextButton}
              >
                다음
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
                    가입 중...
                  </>
                ) : (
                  '회원가입 완료'
                )}
              </button>
            )}
          </div>
        </form>

        <div className={styles.loginPrompt}>
          <p>
            이미 회원이신가요?{' '}
            <Link to="/member/login" className={styles.loginLink}>
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MemberSignupPage;