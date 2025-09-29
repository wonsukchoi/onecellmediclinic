import React, { useState, useEffect, useCallback } from "react";
import { Select } from "@mantine/core";
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

const consultationOptions = [
  { value: "성형외과 상담", label: "성형외과 상담" },
  { value: "피부과 상담", label: "피부과 상담" },
  { value: "미용 시술 상담", label: "미용 시술 상담" },
  { value: "레이저 치료 상담", label: "레이저 치료 상담" },
  { value: "주름 개선 상담", label: "주름 개선 상담" },
  { value: "여드름 치료 상담", label: "여드름 치료 상담" },
  { value: "기타 상담", label: "기타 상담" },
];

const StickyScrollBar: React.FC<StickyScrollBarProps> = ({ className }) => {
  const [lastScrollY, setLastScrollY] = useState(0);
  // Removed unused variables: isCollapsed, setIsCollapsed, navigate, location, isVisible, scrollDirection

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

  // Handle scroll tracking for future use
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
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
        [field]:
          field === "privacyConsent" || field === "marketingConsent"
            ? value === "true"
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
          preferredDate: new Date().toISOString().split("T")[0], // Use today's date as default
          preferredTime: "09:00", // Default time
          notes:
            appointmentForm.memo.trim() ||
            "홈페이지 하단 바에서 빠른 상담 문의",
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
              <input
                id="patientName"
                type="text"
                className={styles.formInput}
                placeholder="이름"
                value={appointmentForm.patientName}
                onChange={(e) =>
                  handleAppointmentFormChange("patientName", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input
                id="patientPhone"
                type="tel"
                className={styles.formInput}
                placeholder="연락처"
                value={appointmentForm.patientPhone}
                onChange={(e) =>
                  handleAppointmentFormChange("patientPhone", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <Select
                id="consultationItem"
                className={styles.formSelect}
                placeholder="상담 항목"
                data={consultationOptions}
                value={appointmentForm.consultationItem}
                onChange={(value) =>
                  handleAppointmentFormChange("consultationItem", value || "")
                }
                disabled={appointmentForm.isSubmitting}
                required
                clearable={false}
                searchable={false}
                allowDeselect={false}
              />
            </div>

            <div className={styles.formGroup}>
              <textarea
                id="memo"
                className={styles.formTextarea}
                placeholder="남길 메모"
                value={appointmentForm.memo}
                onChange={(e) =>
                  handleAppointmentFormChange("memo", e.target.value)
                }
                disabled={appointmentForm.isSubmitting}
                rows={3}
              />
            </div>

            <div className={styles.actionGroup}>
              <div className={styles.consentContainer}>
                <div className={styles.consentItem}>
                  <input
                    type="checkbox"
                    id="privacyConsent"
                    checked={appointmentForm.privacyConsent}
                    onChange={(e) =>
                      handleAppointmentFormChange(
                        "privacyConsent",
                        e.target.checked.toString()
                      )
                    }
                    className={styles.consentCheckbox}
                    required
                  />
                  <label
                    htmlFor="privacyConsent"
                    className={styles.consentLabel}
                  >
                    개인정보 수집 및 이용 동의{" "}
                    <span className={styles.requiredMark}>(필수)</span>
                  </label>
                </div>
                <div className={styles.consentItem}>
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    checked={appointmentForm.marketingConsent}
                    onChange={(e) =>
                      handleAppointmentFormChange(
                        "marketingConsent",
                        e.target.checked.toString()
                      )
                    }
                    className={styles.consentCheckbox}
                  />
                  <label
                    htmlFor="marketingConsent"
                    className={styles.consentLabel}
                  >
                    마케팅 및 광고 동의{" "}
                    <span className={styles.optionalMark}>(선택)</span>
                  </label>
                </div>
              </div>
            </div>
            <div>
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StickyScrollBar;
