import React, { useState } from 'react';
import { DatabaseService } from '../services/supabase';
import type { ContactFormData } from '../types';
import { Icon } from '../components/icons';
import styles from './ContactPage.module.css';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    message: '',
    preferredContact: 'email'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const serviceTypes = [
    { value: '', label: '문의 유형을 선택해주세요' },
    { value: 'consultation', label: '상담 문의' },
    { value: 'appointment', label: '예약 문의' },
    { value: 'procedure', label: '시술 문의' },
    { value: 'general', label: '일반 문의' },
    { value: 'complaint', label: '불만 접수' },
    { value: 'partnership', label: '제휴 문의' }
  ];

  const businessHours = [
    { day: '월요일', hours: '09:00 - 18:00' },
    { day: '화요일', hours: '09:00 - 18:00' },
    { day: '수요일', hours: '09:00 - 18:00' },
    { day: '목요일', hours: '09:00 - 18:00' },
    { day: '금요일', hours: '09:00 - 18:00' },
    { day: '토요일', hours: '09:00 - 17:00' },
    { day: '일요일', hours: '휴진' }
  ];

  const contactMethods = [
    {
      icon: 'chat',
      title: '전화 문의',
      value: '02-1234-5678',
      description: '진료시간 내 상담 가능',
      action: 'tel:02-1234-5678'
    },
    {
      icon: 'mail',
      title: '이메일 문의',
      value: 'info@onecellclinic.com',
      description: '24시간 접수, 영업일 내 답변',
      action: 'mailto:info@onecellclinic.com'
    },
    {
      icon: 'chat',
      title: '카카오톡',
      value: '@원셀의료의원',
      description: '빠른 상담 가능',
      action: 'https://pf.kakao.com/_원셀의료의원'
    },
    {
      icon: 'star',
      title: '주소',
      value: '서울시 강남구 테헤란로 123',
      description: '지하철 2호선 강남역 5번 출구',
      action: 'https://maps.google.com/search/서울시+강남구+테헤란로+123'
    }
  ];

  const handleInputChange = (name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setSubmitError(null);
  };

  const validateForm = (): boolean => {
    return !!(
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.serviceType &&
      formData.message
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError('모든 필수 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await DatabaseService.submitContactForm(formData);

      if (result.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: '',
          message: '',
          preferredContact: 'email'
        });
      } else {
        setSubmitError(result.error || '문의 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setSubmitError('문의 등록에 실패했습니다. 다시 시도해주세요.');
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
          <h1 className={styles.heroTitle}>연락처 및 찾아오시는 길</h1>
          <p className={styles.heroDescription}>
            궁금한 점이 있으시면 언제든지 연락해주세요
          </p>
        </div>
      </section>

      <section className={styles.contactMethods}>
        <div className={styles.contactMethodsContent}>
          <h2 className={styles.sectionTitle}>연락 방법</h2>
          <div className={styles.methodsGrid}>
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.action}
                className={styles.methodCard}
                target={method.action.startsWith('http') ? '_blank' : undefined}
                rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <div className={styles.methodIcon}>
                  <Icon name={method.icon as any} size={32} />
                </div>
                <h3 className={styles.methodTitle}>{method.title}</h3>
                <p className={styles.methodValue}>{method.value}</p>
                <p className={styles.methodDescription}>{method.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.businessHours}>
        <div className={styles.businessHoursContent}>
          <h2 className={styles.sectionTitle}>진료 시간</h2>
          <div className={styles.hoursTable}>
            {businessHours.map((schedule, index) => (
              <div key={index} className={styles.hoursRow}>
                <span className={styles.day}>{schedule.day}</span>
                <span className={`${styles.hours} ${schedule.hours === '휴진' ? styles.closed : ''}`}>
                  {schedule.hours}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.notice}>
            <Icon name="alertTriangle" size={16} />
            <span>공휴일은 휴진입니다. 응급시에는 전화로 문의해주세요.</span>
          </div>
        </div>
      </section>

      <section className={styles.location}>
        <div className={styles.locationContent}>
          <h2 className={styles.sectionTitle}>찾아오시는 길</h2>
          <div className={styles.locationGrid}>
            <div className={styles.locationInfo}>
              <div className={styles.addressCard}>
                <h3 className={styles.addressTitle}>
                  <Icon name="star" size={20} />
                  원셀의료의원
                </h3>
                <p className={styles.address}>
                  서울시 강남구 테헤란로 123<br />
                  ABC빌딩 5층
                </p>

                <div className={styles.transportation}>
                  <h4 className={styles.transportTitle}>대중교통</h4>
                  <ul className={styles.transportList}>
                    <li>
                      <Icon name="clock" size={16} />
                      지하철 2호선 강남역 5번 출구 도보 3분
                    </li>
                    <li>
                      <Icon name="clock" size={16} />
                      지하철 9호선 신논현역 1번 출구 도보 7분
                    </li>
                    <li>
                      <Icon name="clock" size={16} />
                      버스 146, 360, 740 강남역 하차
                    </li>
                  </ul>
                </div>

                <div className={styles.parking}>
                  <h4 className={styles.parkingTitle}>
                    <Icon name="clock" size={16} />
                    주차 안내
                  </h4>
                  <p>건물 지하 1-3층 주차장 이용 가능<br />
                  진료 환자 2시간 무료 주차</p>
                </div>
              </div>
            </div>

            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.4521!2d127.0286!3d37.5665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDMzJzU5LjQiTiAxMjfCsDAzJzE5LjEiRQ!5e0!3m2!1sko!2skr!4v1234567890123"
                className={styles.map}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="원셀의료의원 위치"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contactForm}>
        <div className={styles.contactFormContent}>
          <h2 className={styles.sectionTitle}>온라인 문의</h2>
          <p className={styles.formDescription}>
            문의사항이 있으시면 아래 양식을 작성해주세요. 빠른 시일 내에 답변드리겠습니다.
          </p>

          {submitSuccess ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <Icon name="check" size={48} />
              </div>
              <h3 className={styles.successTitle}>문의가 성공적으로 접수되었습니다!</h3>
              <p className={styles.successDescription}>
                빠른 시일 내에 답변드리겠습니다.<br />
                급한 문의사항은 전화로 연락해주세요.
              </p>
              <button onClick={resetSuccess} className={styles.newInquiryButton}>
                새 문의하기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
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
                  <label className={styles.label}>문의 유형 *</label>
                  <select
                    className={styles.select}
                    value={formData.serviceType}
                    onChange={(e) => handleInputChange('serviceType', e.target.value)}
                    required
                  >
                    {serviceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>선호 연락 방법</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="preferredContact"
                      value="email"
                      checked={formData.preferredContact === 'email'}
                      onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                      className={styles.radio}
                    />
                    <span>이메일</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="preferredContact"
                      value="phone"
                      checked={formData.preferredContact === 'phone'}
                      onChange={(e) => handleInputChange('preferredContact', e.target.value)}
                      className={styles.radio}
                    />
                    <span>전화</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>문의 내용 *</label>
                <textarea
                  className={styles.textarea}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="문의하실 내용을 자세히 적어주세요"
                  rows={5}
                  required
                />
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
                      전송 중...
                    </>
                  ) : (
                    <>
                      문의하기
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

export default ContactPage;