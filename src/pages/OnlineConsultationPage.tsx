import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/supabase';
import type { ConsultationRequest, Procedure } from '../types';
import { Icon } from '../components/icons';
import styles from './OnlineConsultationPage.module.css';

interface ConsultationFormData {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_age: number | '';
  consultation_type: string;
  procedure_interest: string;
  concerns: string;
  medical_history: string;
  current_medications: string;
  preferred_contact_method: string;
  urgency_level: string;
  photos: File[];
}

const OnlineConsultationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ConsultationFormData>({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    patient_age: '',
    consultation_type: '',
    procedure_interest: '',
    concerns: '',
    medical_history: '',
    current_medications: '',
    preferred_contact_method: 'email',
    urgency_level: 'normal',
    photos: []
  });

  const consultationTypes = [
    { value: 'general', label: '일반 상담' },
    { value: 'procedure', label: '시술 상담' },
    { value: 'follow-up', label: '사후 상담' },
    { value: 'emergency', label: '응급 상담' }
  ];

  const urgencyLevels = [
    { value: 'low', label: '낮음' },
    { value: 'normal', label: '보통' },
    { value: 'high', label: '높음' },
    { value: 'urgent', label: '긴급' }
  ];

  const contactMethods = [
    { value: 'email', label: '이메일' },
    { value: 'phone', label: '전화' },
    { value: 'both', label: '이메일 + 전화' }
  ];

  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    const result = await AdminService.getAll<Procedure>('procedures', {
      filters: { active: true },
      sort: { field: 'name', direction: 'asc' }
    });

    if (result.success && result.data) {
      setProcedures(result.data.data);
    }
  };

  const handleInputChange = (name: keyof ConsultationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files).slice(0, 5);
      setFormData(prev => ({
        ...prev,
        photos: fileArray
      }));
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.patient_name &&
          formData.patient_email &&
          formData.patient_phone &&
          formData.patient_age
        );
      case 2:
        return !!(
          formData.consultation_type &&
          formData.procedure_interest
        );
      case 3:
        return !!(
          formData.concerns &&
          formData.preferred_contact_method &&
          formData.urgency_level
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const consultationData = {
        patient_name: formData.patient_name,
        patient_email: formData.patient_email,
        patient_phone: formData.patient_phone,
        patient_age: Number(formData.patient_age),
        consultation_type: formData.consultation_type,
        procedure_interest: formData.procedure_interest,
        concerns: formData.concerns,
        medical_history: formData.medical_history,
        current_medications: formData.current_medications,
        preferred_contact_method: formData.preferred_contact_method,
        urgency_level: formData.urgency_level,
        status: 'pending',
        follow_up_required: true
      };

      const result = await AdminService.create<ConsultationRequest>('consultation_requests', consultationData);

      if (result.success) {
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error submitting consultation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_email: '',
      patient_phone: '',
      patient_age: '',
      consultation_type: '',
      procedure_interest: '',
      concerns: '',
      medical_history: '',
      current_medications: '',
      preferred_contact_method: 'email',
      urgency_level: 'normal',
      photos: []
    });
    setCurrentStep(1);
  };

  const renderStepIndicator = () => (
    <div className={styles.stepIndicator}>
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          className={`${styles.stepItem} ${
            step === currentStep ? styles.active :
            step < currentStep ? styles.completed : ''
          }`}
        >
          <div className={styles.stepNumber}>
            {step < currentStep ? (
              <Icon name="check" size={16} />
            ) : (
              step
            )}
          </div>
          <span className={styles.stepLabel}>
            {step === 1 && '개인정보'}
            {step === 2 && '상담종류'}
            {step === 3 && '상세내용'}
            {step === 4 && '완료'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>개인정보 입력</h2>
      <p className={styles.stepDescription}>
        정확한 상담을 위해 개인정보를 입력해주세요
      </p>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>이름 *</label>
          <input
            type="text"
            className={styles.input}
            value={formData.patient_name}
            onChange={(e) => handleInputChange('patient_name', e.target.value)}
            placeholder="성함을 입력해주세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>연령 *</label>
          <input
            type="number"
            className={styles.input}
            value={formData.patient_age}
            onChange={(e) => handleInputChange('patient_age', e.target.value ? Number(e.target.value) : '')}
            placeholder="나이를 입력해주세요"
            min="1"
            max="120"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>이메일 *</label>
          <input
            type="email"
            className={styles.input}
            value={formData.patient_email}
            onChange={(e) => handleInputChange('patient_email', e.target.value)}
            placeholder="이메일을 입력해주세요"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>휴대폰 번호 *</label>
          <input
            type="tel"
            className={styles.input}
            value={formData.patient_phone}
            onChange={(e) => handleInputChange('patient_phone', e.target.value)}
            placeholder="휴대폰 번호를 입력해주세요"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>상담 종류 선택</h2>
      <p className={styles.stepDescription}>
        원하시는 상담 종류와 관심 시술을 선택해주세요
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>상담 종류 *</label>
        <div className={styles.radioGroup}>
          {consultationTypes.map((type) => (
            <label key={type.value} className={styles.radioLabel}>
              <input
                type="radio"
                name="consultation_type"
                value={type.value}
                checked={formData.consultation_type === type.value}
                onChange={(e) => handleInputChange('consultation_type', e.target.value)}
                className={styles.radio}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>관심 시술 *</label>
        <select
          className={styles.select}
          value={formData.procedure_interest}
          onChange={(e) => handleInputChange('procedure_interest', e.target.value)}
        >
          <option value="">시술을 선택해주세요</option>
          {procedures.map((procedure) => (
            <option key={procedure.id} value={procedure.name}>
              {procedure.name}
            </option>
          ))}
          <option value="기타">기타</option>
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>상세 내용 입력</h2>
      <p className={styles.stepDescription}>
        상담에 필요한 상세 정보를 입력해주세요
      </p>

      <div className={styles.formGroup}>
        <label className={styles.label}>상담 내용 및 고민사항 *</label>
        <textarea
          className={styles.textarea}
          value={formData.concerns}
          onChange={(e) => handleInputChange('concerns', e.target.value)}
          placeholder="상담받고 싶은 내용이나 고민사항을 자세히 적어주세요"
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>과거 병력 및 수술 이력</label>
        <textarea
          className={styles.textarea}
          value={formData.medical_history}
          onChange={(e) => handleInputChange('medical_history', e.target.value)}
          placeholder="관련된 과거 병력이나 수술 이력이 있다면 적어주세요"
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>현재 복용 중인 약물</label>
        <textarea
          className={styles.textarea}
          value={formData.current_medications}
          onChange={(e) => handleInputChange('current_medications', e.target.value)}
          placeholder="현재 복용 중인 약물이 있다면 적어주세요"
          rows={2}
        />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.label}>선호 연락 방법 *</label>
          <select
            className={styles.select}
            value={formData.preferred_contact_method}
            onChange={(e) => handleInputChange('preferred_contact_method', e.target.value)}
          >
            {contactMethods.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>긴급도 *</label>
          <select
            className={styles.select}
            value={formData.urgency_level}
            onChange={(e) => handleInputChange('urgency_level', e.target.value)}
          >
            {urgencyLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>관련 사진 (선택사항)</label>
        <div className={styles.fileUpload}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e.target.files)}
            className={styles.fileInput}
            id="photo-upload"
          />
          <label htmlFor="photo-upload" className={styles.fileLabel}>
            <Icon name="image" size={20} />
            사진 선택 (최대 5장)
          </label>
        </div>

        {formData.photos.length > 0 && (
          <div className={styles.photoPreview}>
            {formData.photos.map((photo, index) => (
              <div key={index} className={styles.photoItem}>
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`업로드 사진 ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className={styles.removePhoto}
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className={styles.stepContent}>
      <div className={styles.successContent}>
        <div className={styles.successIcon}>
          <Icon name="check" size={64} />
        </div>
        <h2 className={styles.successTitle}>상담 신청이 완료되었습니다!</h2>
        <p className={styles.successDescription}>
          빠른 시일 내에 전문의가 검토 후 연락드리겠습니다.
          <br />
          긴급한 경우 직접 전화로 문의해주세요.
        </p>

        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <Icon name="chat" size={20} />
            <span>02-1234-5678</span>
          </div>
          <div className={styles.contactItem}>
            <Icon name="mail" size={20} />
            <span>info@onecellclinic.com</span>
          </div>
        </div>

        <div className={styles.successActions}>
          <button onClick={resetForm} className={styles.newConsultButton}>
            새 상담 신청
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>온라인 상담</h1>
          <p className={styles.heroDescription}>
            전문의와의 1:1 맞춤 상담을 받아보세요
          </p>
        </div>
      </section>

      <section className={styles.consultation}>
        <div className={styles.consultationContent}>
          {renderStepIndicator()}

          <div className={styles.formContainer}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {currentStep < 4 && (
            <div className={styles.formActions}>
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className={styles.prevButton}
                >
                  <Icon name="chevronLeft" size={16} />
                  이전
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className={styles.nextButton}
                >
                  다음
                  <Icon name="chevronRight" size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!validateStep(3) || isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="loader" size={16} />
                      제출 중...
                    </>
                  ) : (
                    <>
                      상담 신청
                      <Icon name="mail" size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OnlineConsultationPage;