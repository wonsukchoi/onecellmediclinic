import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMember } from '../contexts/MemberContext';
import { DatabaseService } from '../services/supabase';
import type { AppointmentFormData } from '../types';

const ReservationPage: React.FC = () => {
  const { member } = useMember();
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  // Pre-fill form with member data if logged in
  useEffect(() => {
    if (member) {
      setFormData(prev => ({
        ...prev,
        patientName: member.full_name || '',
        patientEmail: member.email || '',
        patientPhone: member.phone || ''
      }));
    }
  }, [member]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await DatabaseService.bookAppointment(formData);

      if (result.success) {
        setSuccess(true);
        setFormData({
          patientName: member?.full_name || '',
          patientEmail: member?.email || '',
          patientPhone: member?.phone || '',
          serviceType: '',
          preferredDate: '',
          preferredTime: '',
          notes: ''
        });
      } else {
        setError(result.error || '예약 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('예약 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
        <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ color: '#15803d', marginBottom: '1rem' }}>예약이 완료되었습니다!</h2>
            <p style={{ color: '#166534', marginBottom: '2rem' }}>
              예약 내용을 확인한 후 담당자가 연락드리겠습니다.<br />
              빠른 시일 내에 연락드리도록 하겠습니다.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                새 예약하기
              </button>
              {member && (
                <Link
                  to="/member/mypage"
                  style={{
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  마이페이지에서 확인
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '1rem' }}>
            예약 문의
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            원하시는 진료 일정을 선택해주시면 담당자가 연락드리겠습니다.
          </p>
        </div>

        {!member && (
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#1e40af', margin: '0 0 1rem 0' }}>
              <strong>회원이시라면 로그인하시면 더 편리하게 예약하실 수 있습니다!</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link
                to="/member/login"
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                로그인
              </Link>
              <Link
                to="/member/signup"
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: '1px solid #667eea',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                회원가입
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                이름 *
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                이메일 *
              </label>
              <input
                type="email"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                휴대폰 번호 *
              </label>
              <input
                type="tel"
                name="patientPhone"
                value={formData.patientPhone}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                진료 유형 *
              </label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">선택해주세요</option>
                <option value="상담">초기 상담</option>
                <option value="성형수술">성형수술</option>
                <option value="피부과">피부과 진료</option>
                <option value="레이저">레이저 시술</option>
                <option value="보톡스/필러">보톡스/필러</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                희망 날짜 *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                희망 시간 *
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">선택해주세요</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              추가 요청사항
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="원하시는 진료 내용이나 특별한 요청사항이 있으시면 적어주세요."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '예약 중...' : '예약 신청하기'}
          </button>

          <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '1rem', marginBottom: 0 }}>
            * 예약 신청 후 담당자가 확인하여 연락드립니다.<br />
            긴급한 경우 직접 전화 주시기 바랍니다:
            <a href="tel:02-1234-5678" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
              {' '}02-1234-5678
            </a>
          </p>
        </form>
      </div>
    </main>
  );
};

export default ReservationPage;