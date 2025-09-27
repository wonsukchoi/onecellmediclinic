import React, { useState } from 'react';
import { DatabaseService } from '../services/supabase';
import { Icon } from '../components/icons';
import styles from './ModelProgramPage.module.css';

interface ModelApplicationData {
  name: string;
  email: string;
  phone: string;
  age: number | '';
  height: number | '';
  weight: number | '';
  procedure_interest: string;
  experience: string;
  sns_followers: string;
  motivation: string;
  availability: string;
  photos: File[];
  terms_accepted: boolean;
  privacy_accepted: boolean;
}

const ModelProgramPage: React.FC = () => {
  const [formData, setFormData] = useState<ModelApplicationData>({
    name: '',
    email: '',
    phone: '',
    age: '',
    height: '',
    weight: '',
    procedure_interest: '',
    experience: '',
    sns_followers: '',
    motivation: '',
    availability: '',
    photos: [],
    terms_accepted: false,
    privacy_accepted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const procedureOptions = [
    '보톡스',
    '필러',
    '리프팅',
    '레이저 토닝',
    '스킨케어',
    '여드름 치료',
    '기타'
  ];

  const experienceOptions = [
    '없음',
    '1-2회',
    '3-5회',
    '6-10회',
    '10회 이상'
  ];

  const followerOptions = [
    '1000명 미만',
    '1000-5000명',
    '5000-10000명',
    '10000-50000명',
    '50000명 이상'
  ];

  const availabilityOptions = [
    '평일 오전',
    '평일 오후',
    '평일 저녁',
    '주말',
    '언제나 가능'
  ];

  const handleInputChange = (name: keyof ModelApplicationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError(null);
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

  const validateForm = (): boolean => {
    return !!(
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.age &&
      formData.procedure_interest &&
      formData.motivation &&
      formData.terms_accepted &&
      formData.privacy_accepted
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError('모든 필수 항목을 입력하고 약관에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        serviceType: 'model',
        message: `
모델 프로그램 신청

나이: ${formData.age}세
키: ${formData.height || '미입력'}cm
몸무게: ${formData.weight || '미입력'}kg
관심 시술: ${formData.procedure_interest}
시술 경험: ${formData.experience}
SNS 팔로워: ${formData.sns_followers}
지원 동기: ${formData.motivation}
가능 시간: ${formData.availability}
사진 첨부: ${formData.photos.length}장
        `,
        preferredContact: 'email' as 'email' | 'phone'
      };

      const result = await DatabaseService.submitContactForm(contactData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          age: '',
          height: '',
          weight: '',
          procedure_interest: '',
          experience: '',
          sns_followers: '',
          motivation: '',
          availability: '',
          photos: [],
          terms_accepted: false,
          privacy_accepted: false
        });
      } else {
        setSubmitError(result.error || '신청서 제출에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setSubmitError('신청서 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSuccess = () => {
    setSubmitSuccess(false);
  };

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>모델 프로그램</h1>
          <p className={styles.heroDescription}>
            원셀의료의원과 함께 아름다움을 공유하세요
          </p>
        </div>
      </section>

      <section className={styles.info}>
        <div className={styles.infoContent}>
          <h2 className={styles.sectionTitle}>모델 프로그램이란?</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="star" size={32} />
              </div>
              <h3 className={styles.infoTitle}>특별 혜택</h3>
              <p className={styles.infoText}>
                선정된 모델에게는 시술비 할인 혜택과 함께 전문적인 케어를 제공합니다.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="image" size={32} />
              </div>
              <h3 className={styles.infoTitle}>촬영 참여</h3>
              <p className={styles.infoText}>
                시술 전후 촬영에 참여하여 다른 분들에게 도움이 되는 사례를 공유합니다.
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="medical" size={32} />
              </div>
              <h3 className={styles.infoTitle}>전문 케어</h3>
              <p className={styles.infoText}>
                숙련된 의료진의 정성어린 케어로 최상의 결과를 얻을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <h2 className={styles.sectionTitle}>모델 혜택</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <Icon name="check" size={24} />
              <span>시술비 30-50% 할인 혜택</span>
            </div>
            <div className={styles.benefitItem}>
              <Icon name="check" size={24} />
              <span>전문의 1:1 맞춤 상담</span>
            </div>
            <div className={styles.benefitItem}>
              <Icon name="check" size={24} />
              <span>사후관리 서비스 제공</span>
            </div>
            <div className={styles.benefitItem}>
              <Icon name="check" size={24} />
              <span>추가 시술시 지속 할인</span>
            </div>
            <div className={styles.benefitItem}>
              <Icon name="check" size={24} />
              <span>SNS 마케팅 협업 기회</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.requirements}>
        <div className={styles.requirementsContent}>
          <h2 className={styles.sectionTitle}>지원 자격</h2>
          <div className={styles.requirementsList}>
            <div className={styles.requirementItem}>
              <Icon name="user" size={20} />
              <span>만 19세 이상 성인</span>
            </div>
            <div className={styles.requirementItem}>
              <Icon name="image" size={20} />
              <span>시술 전후 촬영 동의</span>
            </div>
            <div className={styles.requirementItem}>
              <Icon name="chat" size={20} />
              <span>후기 작성 및 SNS 공유 가능</span>
            </div>
            <div className={styles.requirementItem}>
              <Icon name="calendar" size={20} />
              <span>정해진 일정에 내원 가능</span>
            </div>
            <div className={styles.requirementItem}>
              <Icon name="settings" size={20} />
              <span>모델 계약서 작성 동의</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.application}>
        <div className={styles.applicationContent}>
          <h2 className={styles.sectionTitle}>모델 신청</h2>

          {submitSuccess ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <Icon name="check" size={48} />
              </div>
              <h3 className={styles.successTitle}>신청이 완료되었습니다!</h3>
              <p className={styles.successDescription}>
                신청서를 검토한 후 영업일 기준 3-5일 내에 연락드리겠습니다.<br />
                선정 여부는 개별적으로 안내해드립니다.
              </p>
              <button onClick={resetSuccess} className={styles.newApplicationButton}>
                새 신청서 작성
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>개인정보</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>이름 *</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="성함을 입력해주세요"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>나이 *</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value ? Number(e.target.value) : '')}
                      placeholder="만 나이"
                      min="19"
                      max="80"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>키 (선택)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value ? Number(e.target.value) : '')}
                      placeholder="cm"
                      min="100"
                      max="250"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>몸무게 (선택)</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value ? Number(e.target.value) : '')}
                      placeholder="kg"
                      min="30"
                      max="200"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>이메일 *</label>
                    <input
                      type="email"
                      className={styles.input}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일을 입력해주세요"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>휴대폰 번호 *</label>
                    <input
                      type="tel"
                      className={styles.input}
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="휴대폰 번호를 입력해주세요"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>시술 관련 정보</h3>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>관심 시술 *</label>
                    <select
                      className={styles.select}
                      value={formData.procedure_interest}
                      onChange={(e) => handleInputChange('procedure_interest', e.target.value)}
                      required
                    >
                      <option value="">선택해주세요</option>
                      {procedureOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>시술 경험</label>
                    <select
                      className={styles.select}
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                    >
                      <option value="">선택해주세요</option>
                      {experienceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>SNS 팔로워 수</label>
                    <select
                      className={styles.select}
                      value={formData.sns_followers}
                      onChange={(e) => handleInputChange('sns_followers', e.target.value)}
                    >
                      <option value="">선택해주세요</option>
                      {followerOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>가능한 시간대</label>
                    <select
                      className={styles.select}
                      value={formData.availability}
                      onChange={(e) => handleInputChange('availability', e.target.value)}
                    >
                      <option value="">선택해주세요</option>
                      {availabilityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>지원 동기</h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>지원 동기 및 각오 *</label>
                  <textarea
                    className={styles.textarea}
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="모델 프로그램에 지원하는 이유와 각오를 적어주세요"
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>사진 첨부 (선택)</h3>
                <div className={styles.formGroup}>
                  <label className={styles.label}>본인 사진 (최대 5장)</label>
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

              <div className={styles.formSection}>
                <h3 className={styles.formSectionTitle}>약관 동의</h3>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
                      className={styles.checkbox}
                      required
                    />
                    <span>모델 프로그램 이용약관에 동의합니다 *</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.privacy_accepted}
                      onChange={(e) => handleInputChange('privacy_accepted', e.target.checked)}
                      className={styles.checkbox}
                      required
                    />
                    <span>개인정보 수집 및 이용에 동의합니다 *</span>
                  </label>
                </div>
              </div>

              {submitError && (
                <div className={styles.errorMessage}>
                  <Icon name="alertTriangle" size={16} />
                  {submitError}
                </div>
              )}

              <div className={styles.formActions}>
                <button
                  type="submit"
                  disabled={!validateForm() || isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="loader" size={16} />
                      제출 중...
                    </>
                  ) : (
                    <>
                      신청서 제출
                      <Icon name="mail" size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ModelProgramPage;