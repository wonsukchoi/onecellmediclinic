import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../icons';
import { DatabaseService } from '../../services/supabase';
import type { AppointmentFormData } from '../../types';
import styles from './StickyScrollBar.module.css';

interface StickyScrollBarProps {
  className?: string;
}

interface AppointmentFormState {
  patientName: string;
  patientPhone: string;
  preferredDate: string;
  preferredTime: string;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

const StickyScrollBar: React.FC<StickyScrollBarProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true); // Changed to true for immediate visibility
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is homepage
  const isHomepage = location.pathname === '/';

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>({
    patientName: '',
    patientPhone: '',
    preferredDate: '',
    preferredTime: '',
    isSubmitting: false,
    error: null,
    success: false,
  });

  // Handle scroll direction and visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always visible for now (for debugging)
      setIsVisible(true);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });
    return () => window.removeEventListener('scroll', scrollListener);
  }, [lastScrollY]);

  // Smooth scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Quick action handlers
  const handleConsultation = useCallback(() => {
    navigate('/consultation');
  }, [navigate]);

  const handlePhoneCall = useCallback(() => {
    window.location.href = 'tel:+82-2-1234-5678';
  }, []);

  const handleKakaoTalk = useCallback(() => {
    window.open('https://pf.kakao.com/_xmKKBxj', '_blank', 'noopener,noreferrer');
  }, []);

  // Appointment form handlers
  const handleAppointmentFormChange = useCallback((field: keyof AppointmentFormState, value: string) => {
    setAppointmentForm(prev => ({
      ...prev,
      [field]: value,
      error: null, // Clear error when user starts typing
      success: false, // Clear success when user modifies form
    }));
  }, []);

  const handleAppointmentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!appointmentForm.patientName.trim() || !appointmentForm.patientPhone.trim() ||
        !appointmentForm.preferredDate || !appointmentForm.preferredTime) {
      setAppointmentForm(prev => ({ ...prev, error: '모든 필수 필드를 입력해주세요.' }));
      return;
    }

    setAppointmentForm(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const appointmentData: AppointmentFormData = {
        patientName: appointmentForm.patientName.trim(),
        patientEmail: 'quickbooking@clinic.temp', // Placeholder email for quick bookings from homepage
        patientPhone: appointmentForm.patientPhone.trim(),
        serviceType: '상담', // Default to consultation
        preferredDate: appointmentForm.preferredDate,
        preferredTime: appointmentForm.preferredTime,
        notes: '홈페이지 하단 바에서 빠른 예약',
      };

      const result = await DatabaseService.bookAppointment(appointmentData);

      if (result.success) {
        setAppointmentForm({
          patientName: '',
          patientPhone: '',
          preferredDate: '',
          preferredTime: '',
          isSubmitting: false,
          error: null,
          success: true,
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setAppointmentForm(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        setAppointmentForm(prev => ({
          ...prev,
          isSubmitting: false,
          error: result.error || '예약 중 오류가 발생했습니다.',
        }));
      }
    } catch (error) {
      setAppointmentForm(prev => ({
        ...prev,
        isSubmitting: false,
        error: '예약 중 오류가 발생했습니다.',
      }));
    }
  }, [appointmentForm]);

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];

  const stickyBarClasses = [
    styles.stickyScrollBar,
    isVisible ? styles.visible : '',
    scrollDirection === 'down' ? styles.hidden : '',
    isHomepage ? styles.homepage : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={stickyBarClasses}>
      {/* Desktop vertical sidebar - only show on non-homepage */}
      {!isHomepage && (
        <div className={styles.desktopSidebar}>
          <button
            className={styles.actionButton}
            onClick={handleConsultation}
            aria-label="상담 예약"
            title="상담 예약"
          >
            <Icon name="medical" size="md" />
            <span className={styles.buttonText}>상담 예약</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={handlePhoneCall}
            aria-label="전화 문의"
            title="전화 문의"
          >
            <Icon name="phone" size="md" />
            <span className={styles.buttonText}>전화 문의</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={handleKakaoTalk}
            aria-label="카카오톡 상담"
            title="카카오톡 상담"
          >
            <Icon name="chat" size="md" />
            <span className={styles.buttonText}>카카오톡 상담</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={scrollToTop}
            aria-label="맨 위로"
            title="맨 위로"
          >
            <Icon name="arrowUp" size="md" />
            <span className={styles.buttonText}>맨 위로</span>
          </button>
        </div>
      )}

      {/* Mobile horizontal bottom bar - show on non-homepage mobile */}
      {!isHomepage && (
        <div className={styles.mobileBottomBar}>
          <button
            className={styles.mobileButton}
            onClick={handleConsultation}
            aria-label="상담 예약"
          >
            <Icon name="medical" size="sm" />
            <span className={styles.mobileButtonText}>상담</span>
          </button>

          <button
            className={styles.mobileButton}
            onClick={handlePhoneCall}
            aria-label="전화 문의"
          >
            <Icon name="phone" size="sm" />
            <span className={styles.mobileButtonText}>전화</span>
          </button>

          <button
            className={styles.mobileButton}
            onClick={handleKakaoTalk}
            aria-label="카카오톡"
          >
            <Icon name="chat" size="sm" />
            <span className={styles.mobileButtonText}>카카오톡</span>
          </button>

          <button
            className={styles.mobileButton}
            onClick={scrollToTop}
            aria-label="맨 위로"
          >
            <Icon name="arrowUp" size="sm" />
            <span className={styles.mobileButtonText}>위로</span>
          </button>
        </div>
      )}

      {/* Homepage appointment booking form - always visible on homepage for all screen sizes */}
      {isHomepage && (
        <div className={styles.homepageBottomBar}>
          <form className={styles.appointmentForm} onSubmit={handleAppointmentSubmit}>
            {appointmentForm.success && (
              <div className={styles.successMessage}>
                <Icon name="check" size="sm" />
                <span>예약이 성공적으로 접수되었습니다!</span>
              </div>
            )}

            {appointmentForm.error && (
              <div className={styles.errorMessage}>
                <Icon name="warning" size="sm" />
                <span>{appointmentForm.error}</span>
              </div>
            )}

            <div className={styles.formFields}>
              <div className={styles.formGroup}>
                <label htmlFor="patientName" className={styles.formLabel}>이름</label>
                <input
                  id="patientName"
                  type="text"
                  className={styles.formInput}
                  placeholder="이름을 입력하세요"
                  value={appointmentForm.patientName}
                  onChange={(e) => handleAppointmentFormChange('patientName', e.target.value)}
                  disabled={appointmentForm.isSubmitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="patientPhone" className={styles.formLabel}>연락처</label>
                <input
                  id="patientPhone"
                  type="tel"
                  className={styles.formInput}
                  placeholder="010-0000-0000"
                  value={appointmentForm.patientPhone}
                  onChange={(e) => handleAppointmentFormChange('patientPhone', e.target.value)}
                  disabled={appointmentForm.isSubmitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="preferredDate" className={styles.formLabel}>예약일</label>
                <input
                  id="preferredDate"
                  type="date"
                  className={styles.formInput}
                  value={appointmentForm.preferredDate}
                  min={today}
                  onChange={(e) => handleAppointmentFormChange('preferredDate', e.target.value)}
                  disabled={appointmentForm.isSubmitting}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="preferredTime" className={styles.formLabel}>예약시간</label>
                <select
                  id="preferredTime"
                  className={styles.formSelect}
                  value={appointmentForm.preferredTime}
                  onChange={(e) => handleAppointmentFormChange('preferredTime', e.target.value)}
                  disabled={appointmentForm.isSubmitting}
                  required
                >
                  <option value="">시간 선택</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={appointmentForm.isSubmitting}
              >
                {appointmentForm.isSubmitting ? (
                  <>
                    <Icon name="loader" size="sm" />
                    <span>예약 중...</span>
                  </>
                ) : (
                  <>
                    <Icon name="medical" size="sm" />
                    <span>예약하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StickyScrollBar;