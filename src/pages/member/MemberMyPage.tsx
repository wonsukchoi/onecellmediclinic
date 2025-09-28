import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MemberService } from '../../services/member.service';
import type { MemberDashboardData } from '../../types';
import styles from './MemberMyPage.module.css';

const MemberMyPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check if user is logged in
      const currentMember = await MemberService.getCurrentMember();
      if (!currentMember.success || !currentMember.data) {
        navigate('/member/login', { state: { from: { pathname: '/member/mypage' } } });
        return;
      }

      // Load dashboard data
      const result = await MemberService.getMemberDashboardData(currentMember.data.id);
      if (result.success) {
        setDashboardData(result.data!);
      } else {
        setError(result.error || '데이터를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const result = await MemberService.signOut();
    if (result.success) {
      navigate('/member/login');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const getMembershipBadgeColor = (type: 'basic' | 'premium' | 'vip') => {
    switch (type) {
      case 'vip': return styles.vipBadge;
      case 'premium': return styles.premiumBadge;
      default: return styles.basicBadge;
    }
  };

  const getMembershipName = (type: 'basic' | 'premium' | 'vip') => {
    switch (type) {
      case 'vip': return 'VIP 회원';
      case 'premium': return '프리미엄 회원';
      default: return '일반 회원';
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>회원 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} className={styles.retryButton}>
          다시 시도
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { profile, upcomingAppointments, recentMedicalRecords, activePrescriptions, membershipStatus } = dashboardData;

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <h3>다음 예약</h3>
            <p>{upcomingAppointments.length > 0
              ? formatDate(upcomingAppointments[0].preferred_date)
              : '예약 없음'
            }</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏥</div>
          <div className={styles.statInfo}>
            <h3>총 방문 횟수</h3>
            <p>{profile.total_visits || 0}회</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💊</div>
          <div className={styles.statInfo}>
            <h3>활성 처방전</h3>
            <p>{activePrescriptions.length}개</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔔</div>
          <div className={styles.statInfo}>
            <h3>알림</h3>
            <p>{dashboardData.unreadNotifications}개</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h3>최근 활동</h3>

        {upcomingAppointments.length > 0 && (
          <div className={styles.activityCard}>
            <h4>예정된 예약</h4>
            <div className={styles.appointmentList}>
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className={styles.appointmentItem}>
                  <div className={styles.appointmentDate}>
                    {formatDate(appointment.preferred_date)} {appointment.preferred_time}
                  </div>
                  <div className={styles.appointmentType}>{appointment.service_type}</div>
                  <div className={`${styles.appointmentStatus} ${styles[appointment.status]}`}>
                    {appointment.status === 'pending' ? '대기 중' :
                     appointment.status === 'confirmed' ? '확정' :
                     appointment.status === 'cancelled' ? '취소됨' : '완료'}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/member/appointments" className={styles.viewAllLink}>
              모든 예약 보기 →
            </Link>
          </div>
        )}

        {recentMedicalRecords.length > 0 && (
          <div className={styles.activityCard}>
            <h4>최근 진료 기록</h4>
            <div className={styles.recordList}>
              {recentMedicalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className={styles.recordItem}>
                  <div className={styles.recordDate}>{formatDate(record.visit_date)}</div>
                  <div className={styles.recordDiagnosis}>{record.diagnosis}</div>
                  <div className={styles.recordProvider}>
                    {record.provider?.full_name || '담당의사'}
                  </div>
                </div>
              ))}
            </div>
            <Link to="/member/medical-records" className={styles.viewAllLink}>
              모든 진료 기록 보기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className={styles.appointmentsContent}>
      <div className={styles.sectionHeader}>
        <h3>예약 관리</h3>
        <Link to="/reservation" className={styles.newAppointmentButton}>
          새 예약 만들기
        </Link>
      </div>

      {upcomingAppointments.length > 0 ? (
        <div className={styles.appointmentsList}>
          {upcomingAppointments.map((appointment) => (
            <div key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.appointmentHeader}>
                <div className={styles.appointmentDateTime}>
                  <div className={styles.date}>{formatDate(appointment.preferred_date)}</div>
                  <div className={styles.time}>{appointment.preferred_time}</div>
                </div>
                <div className={`${styles.statusBadge} ${styles[appointment.status]}`}>
                  {appointment.status === 'pending' ? '대기 중' :
                   appointment.status === 'confirmed' ? '확정' :
                   appointment.status === 'cancelled' ? '취소됨' : '완료'}
                </div>
              </div>

              <div className={styles.appointmentBody}>
                <div className={styles.serviceType}>{appointment.service_type}</div>
                <div className={styles.patientInfo}>
                  환자: {appointment.patient_name} | {appointment.patient_phone}
                </div>
                {appointment.notes && (
                  <div className={styles.appointmentNotes}>메모: {appointment.notes}</div>
                )}
              </div>

              <div className={styles.appointmentActions}>
                {appointment.status === 'pending' && (
                  <button className={styles.cancelButton}>예약 취소</button>
                )}
                {appointment.status === 'confirmed' && (
                  <button className={styles.rescheduleButton}>일정 변경</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h4>예정된 예약이 없습니다</h4>
          <p>새로운 예약을 만들어보세요.</p>
          <Link to="/reservation" className={styles.createAppointmentButton}>
            예약하기
          </Link>
        </div>
      )}
    </div>
  );

  const renderMedicalRecords = () => (
    <div className={styles.medicalRecordsContent}>
      <div className={styles.sectionHeader}>
        <h3>진료 기록</h3>
      </div>

      {recentMedicalRecords.length > 0 ? (
        <div className={styles.recordsList}>
          {recentMedicalRecords.map((record) => (
            <div key={record.id} className={styles.recordCard}>
              <div className={styles.recordHeader}>
                <div className={styles.recordDate}>{formatDate(record.visit_date)}</div>
                <div className={`${styles.recordStatus} ${styles[record.status]}`}>
                  {record.status === 'completed' ? '완료' :
                   record.status === 'in_progress' ? '진행 중' : '취소'}
                </div>
              </div>

              <div className={styles.recordBody}>
                <div className={styles.diagnosis}>
                  <strong>진단:</strong> {record.diagnosis}
                </div>
                {record.treatment_plan && (
                  <div className={styles.treatmentPlan}>
                    <strong>치료 계획:</strong> {record.treatment_plan}
                  </div>
                )}
                {record.provider && (
                  <div className={styles.provider}>
                    <strong>담당의:</strong> {record.provider.full_name}
                  </div>
                )}
                {record.notes && (
                  <div className={styles.notes}>
                    <strong>추가 메모:</strong> {record.notes}
                  </div>
                )}
              </div>

              {record.follow_up_date && (
                <div className={styles.followUp}>
                  <strong>다음 방문 예정:</strong> {formatDate(record.follow_up_date)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h4>진료 기록이 없습니다</h4>
          <p>첫 방문을 예약해보세요.</p>
        </div>
      )}
    </div>
  );

  const renderPrescriptions = () => (
    <div className={styles.prescriptionsContent}>
      <div className={styles.sectionHeader}>
        <h3>처방전 관리</h3>
      </div>

      {activePrescriptions.length > 0 ? (
        <div className={styles.prescriptionsList}>
          {activePrescriptions.map((prescription) => (
            <div key={prescription.id} className={styles.prescriptionCard}>
              <div className={styles.prescriptionHeader}>
                <div className={styles.medicationName}>{prescription.medication_name}</div>
                <div className={`${styles.prescriptionStatus} ${styles[prescription.status]}`}>
                  {prescription.status === 'active' ? '활성' :
                   prescription.status === 'completed' ? '완료' : '취소'}
                </div>
              </div>

              <div className={styles.prescriptionBody}>
                <div className={styles.dosageInfo}>
                  <div><strong>용량:</strong> {prescription.dosage}</div>
                  <div><strong>복용법:</strong> {prescription.frequency}</div>
                  <div><strong>기간:</strong> {prescription.duration}</div>
                </div>

                {prescription.instructions && (
                  <div className={styles.instructions}>
                    <strong>복용 지침:</strong> {prescription.instructions}
                  </div>
                )}

                <div className={styles.prescriptionMeta}>
                  <div>처방일: {formatDate(prescription.prescribed_date)}</div>
                  {prescription.expiry_date && (
                    <div>만료일: {formatDate(prescription.expiry_date)}</div>
                  )}
                  {prescription.provider && (
                    <div>처방의: {prescription.provider.full_name}</div>
                  )}
                </div>

                {prescription.refills_remaining !== undefined && (
                  <div className={styles.refillInfo}>
                    <strong>남은 재처방:</strong> {prescription.refills_remaining}회
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💊</div>
          <h4>활성 처방전이 없습니다</h4>
          <p>현재 복용 중인 약이 없습니다.</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className={styles.profileContent}>
      <div className={styles.sectionHeader}>
        <h3>회원 정보</h3>
        <button className={styles.editProfileButton}>정보 수정</button>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatar}>
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt="프로필 사진" />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {profile.name?.charAt(0) || profile.email.charAt(0)}
              </div>
            )}
          </div>
          <div className={styles.profileInfo}>
            <h2>{profile.name || '이름 미설정'}</h2>
            <p>{profile.email}</p>
            <div className={`${styles.membershipBadge} ${getMembershipBadgeColor(membershipStatus.type)}`}>
              {getMembershipName(membershipStatus.type)}
            </div>
          </div>
        </div>

        <div className={styles.profileDetails}>
          <div className={styles.detailRow}>
            <span className={styles.label}>휴대폰:</span>
            <span className={styles.value}>{profile.phone || '미입력'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>생년월일:</span>
            <span className={styles.value}>
              {profile.date_of_birth ? formatDate(profile.date_of_birth) : '미입력'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>성별:</span>
            <span className={styles.value}>
              {profile.gender === 'male' ? '남성' :
               profile.gender === 'female' ? '여성' :
               profile.gender === 'other' ? '기타' : '미입력'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>가입일:</span>
            <span className={styles.value}>
              {profile.member_since ? formatDate(profile.member_since) : '정보 없음'}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.label}>총 방문:</span>
            <span className={styles.value}>{profile.total_visits || 0}회</span>
          </div>
        </div>

        <div className={styles.membershipBenefits}>
          <h4>회원 혜택</h4>
          <ul>
            {membershipStatus.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.myPageContainer}>
      <div className={styles.myPageHeader}>
        <div className={styles.welcomeSection}>
          <h1>안녕하세요, {profile.name || '회원'}님!</h1>
          <p>원셀 메디클리닉 회원 서비스에 오신 것을 환영합니다.</p>
        </div>
        <button onClick={handleSignOut} className={styles.signOutButton}>
          로그아웃
        </button>
      </div>

      <div className={styles.myPageContent}>
        <nav className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            대시보드
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'appointments' ? styles.active : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            예약 관리
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'medical-records' ? styles.active : ''}`}
            onClick={() => setActiveTab('medical-records')}
          >
            진료 기록
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'prescriptions' ? styles.active : ''}`}
            onClick={() => setActiveTab('prescriptions')}
          >
            처방전
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            회원 정보
          </button>
        </nav>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'appointments' && renderAppointments()}
          {activeTab === 'medical-records' && renderMedicalRecords()}
          {activeTab === 'prescriptions' && renderPrescriptions()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  );
};

export default MemberMyPage;