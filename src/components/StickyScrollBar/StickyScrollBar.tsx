import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "../icons";
import { DatabaseService } from "../../services/supabase";
import type { AppointmentFormData } from "../../types";
import styles from "./StickyScrollBar.module.css";

interface StickyScrollBarProps {
  className?: string;
}

interface AppointmentFormState {
  patientName: string;
  patientPhone: string;
  consultationItem: string;
  memo: string;
  privacyConsent: boolean; // Privacy policy consent
  marketingConsent: boolean; // Marketing consent
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
}

const StickyScrollBar: React.FC<StickyScrollBarProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true); // Changed to true for immediate visibility
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is homepage
  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState<AppointmentFormState>({
    patientName: "",
    patientPhone: "",
    consultationItem: "",
    memo: "",
    privacyConsent: false,
    marketingConsent: false,
    isSubmitting: false,
    error: null,
    success: false,
  });

  // Handle scroll direction and visibility
  useEffect(() => {
    // Force visibility on component mount
    setIsVisible(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always keep visible
      setIsVisible(true);

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
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

    window.addEventListener("scroll", scrollListener, { passive: true });
    return () => window.removeEventListener("scroll", scrollListener);
  }, [lastScrollY]);

  // Appointment form handlers
  const handleAppointmentFormChange = useCallback(
    (field: keyof AppointmentFormState, value: string) => {
      setAppointmentForm((prev) => ({
        ...prev,
        // Handle checkbox fields (convert string 'true'/'false' to boolean)
        [field]: field === 'privacyConsent' || field === 'marketingConsent' 
          ? value === 'true' 
          : value,
        error: null, // Clear error when user starts typing
        success: false, // Clear success when user modifies form
      }));
    },
    []
  );

  const handleAppointmentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (
        !appointmentForm.patientName.trim() ||
        !appointmentForm.patientPhone.trim() ||
        !appointmentForm.consultationItem.trim() ||
        !appointmentForm.privacyConsent
      ) {
        setAppointmentForm((prev) => ({
          ...prev,
          error: "모든 필수 항목을 입력하고 개인정보 수집에 동의해주세요.",
        }));
        return;
      }

      setAppointmentForm((prev) => ({
        ...prev,
        isSubmitting: true,
        error: null,
      }));

      try {
        const appointmentData: AppointmentFormData = {
          patientName: appointmentForm.patientName.trim(),
          patientEmail: "quickbooking@clinic.temp", // Placeholder email for quick bookings from homepage
          patientPhone: appointmentForm.patientPhone.trim(),
          serviceType: appointmentForm.consultationItem.trim(),
          preferredDate: new Date().toISOString().split('T')[0], // Use today's date as default
          preferredTime: "09:00", // Default time
          notes: appointmentForm.memo.trim() || "홈페이지 하단 바에서 빠른 상담 문의",
        };

        const result = await DatabaseService.bookAppointment(appointmentData);

        if (result.success) {
          setAppointmentForm({
            patientName: "",
            patientPhone: "",
            consultationItem: "",
            memo: "",
            privacyConsent: false,
            marketingConsent: false,
            isSubmitting: false,
            error: null,
            success: true,
          });

          // Clear success message after 3 seconds
          setTimeout(() => {
            setAppointmentForm((prev) => ({ ...prev, success: false }));
          }, 3000);
        } else {
          setAppointmentForm((prev) => ({
            ...prev,
            isSubmitting: false,
            error: result.error || "상담 문의 중 오류가 발생했습니다.",
          }));
        }
      } catch (error) {
        setAppointmentForm((prev) => ({
          ...prev,
          isSubmitting: false,
          error: "상담 문의 중 오류가 발생했습니다.",
        }));
      }
    },
    [appointmentForm]
  );


  const stickyBarClasses = [styles.stickyScrollBar, styles.visible, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stickyBarClasses}>
      {/* Desktop vertical sidebar - only show on non-homepage */}
      <div className={styles.homepageBottomBar}>
        <form
          className={styles.appointmentForm}
          onSubmit={handleAppointmentSubmit}
        >
          {appointmentForm.success && (
            <div className={styles.successMessage}>
              <Icon name="check" size="sm" />
              <span>상담 문의가 성공적으로 접수되었습니다!</span>
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
              <label htmlFor="patientName" className={styles.formLabel}>
                이름
              </label>
              <input
                id="patientName"
                type="text"
                className={styles.formInput}
                placeholder="이름을 입력하세요"
                value={appointmentForm.patientName}
                onChange={(e) =>
                  handleAppointmentFormChange("patientName", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="patientPhone" className={styles.formLabel}>
                연락처
              </label>
              <input
                id="patientPhone"
                type="tel"
                className={styles.formInput}
                placeholder="010-0000-0000"
                value={appointmentForm.patientPhone}
                onChange={(e) =>
                  handleAppointmentFormChange("patientPhone", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="consultationItem" className={styles.formLabel}>
                상담 항목
              </label>
              <select
                id="consultationItem"
                className={styles.formSelect}
                value={appointmentForm.consultationItem}
                onChange={(e) =>
                  handleAppointmentFormChange("consultationItem", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                required
              >
                <option value="">상담 항목 선택</option>
                <option value="성형외과 상담">성형외과 상담</option>
                <option value="피부과 상담">피부과 상담</option>
                <option value="미용 시술 상담">미용 시술 상담</option>
                <option value="레이저 치료 상담">레이저 치료 상담</option>
                <option value="주름 개선 상담">주름 개선 상담</option>
                <option value="여드름 치료 상담">여드름 치료 상담</option>
                <option value="기타 상담">기타 상담</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="memo" className={styles.formLabel}>
                남길 메모
              </label>
              <textarea
                id="memo"
                className={styles.formTextarea}
                placeholder="궁금한 사항이나 요청사항을 자유롭게 남겨주세요"
                value={appointmentForm.memo}
                onChange={(e) =>
                  handleAppointmentFormChange("memo", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                rows={3}
              />
            </div>

            <div className={styles.actionGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={appointmentForm.isSubmitting}
              >
                {appointmentForm.isSubmitting ? (
                  <>
                    <Icon name="loader" size="sm" />
                    <span>문의 중...</span>
                  </>
                ) : (
                  <>
                    <span>상담 문의</span>
                  </>
                )}
              </button>
              
              <div className={styles.consentContainer}>
                <div className={styles.consentItem}>
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    checked={appointmentForm.privacyConsent}
                    onChange={(e) => handleAppointmentFormChange("privacyConsent", e.target.checked.toString())}
                    className={styles.consentCheckbox}
                    required
                  />
                  <label htmlFor="privacyConsent" className={styles.consentLabel}>
                    개인정보 수집 및 이용 동의 <span className={styles.requiredMark}>(필수)</span>
                  </label>
                </div>
                <div className={styles.consentItem}>
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={appointmentForm.marketingConsent}
                    onChange={(e) => handleAppointmentFormChange("marketingConsent", e.target.checked.toString())}
                    className={styles.consentCheckbox}
                  />
                  <label htmlFor="marketingConsent" className={styles.consentLabel}>
                    마케팅 및 광고 동의 <span className={styles.optionalMark}>(선택)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StickyScrollBar;
