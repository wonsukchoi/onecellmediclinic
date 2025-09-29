import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Icon, type IconName } from '../../components/icons';
import styles from './DashboardPage.module.css';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: IconName;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, link }) => {
  const content = (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.statIcon}>
        <Icon name={icon} size="lg" />
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statValue}>{value.toLocaleString()}</h3>
        <p className={styles.statTitle}>{title}</p>
        {change !== undefined && (
          <div className={styles.statChange}>
            <span className={change >= 0 ? styles.positive : styles.negative}>
              <Icon name={change >= 0 ? 'chevronUp' : 'chevronDown'} size="sm" />
              {Math.abs(change)}
            </span>
            <span className={styles.changeText}>지난 달 대비</span>
          </div>
        )}
      </div>
    </div>
  );

  return link ? <Link to={link} className={styles.statCardLink}>{content}</Link> : content;
};

interface QuickActionProps {
  title: string;
  description: string;
  icon: IconName;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, link, color }) => (
  <Link to={link} className={`${styles.quickAction} ${styles[color]}`}>
    <div className={styles.actionIcon}>
      <Icon name={icon} size="lg" />
    </div>
    <div className={styles.actionContent}>
      <h4 className={styles.actionTitle}>{title}</h4>
      <p className={styles.actionDescription}>{description}</p>
    </div>
    <div className={styles.actionArrow}>
      <Icon name="chevronRight" size="sm" />
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const { stats, refreshStats, loading } = useAdmin();

  useEffect(() => {
    // Only refresh stats if we don't have them yet and we're not loading
    if (!stats && !loading) {
      refreshStats();
    }
  }, [stats, refreshStats, loading]);

  // Show loading only if admin context is loading, not if stats are missing
  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>인증 확인 중...</p>
      </div>
    );
  }

  // If stats are null but we're not loading, show the dashboard with placeholder data
  if (!stats) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>대시보드 데이터 로딩 중...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: '신규 시술 추가',
      description: '새로운 의료 시술을 등록합니다',
      icon: 'medical' as IconName,
      link: '/admin/procedures/new',
      color: 'blue' as const,
    },
    {
      title: '의료진 추가',
      description: '새로운 의료 진을 등록합니다',
      icon: 'user' as IconName,
      link: '/admin/providers/new',
      color: 'green' as const,
    },
    {
      title: '블로그 작성',
      description: '새로운 블로그 글을 작성합니다',
      icon: 'blog' as IconName,
      link: '/admin/blog-posts/new',
      color: 'purple' as const,
    },
    {
      title: '갤러리 사진 업로드',
      description: '전후 비교 사진을 추가합니다',
      icon: 'image' as IconName,
      link: '/admin/gallery-items/new',
      color: 'blue' as const,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.pageTitle}>대시보드 개요</h1>
        <button
          onClick={refreshStats}
          className={styles.refreshButton}
        >
          <Icon name="refresh" size="sm" />
          새로고침
        </button>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="전체 예약"
          value={stats.totalAppointments}
          icon="calendar"
          color="blue"
          link="/admin/appointments"
        />
        <StatCard
          title="대기 중인 예약"
          value={stats.pendingAppointments}
          icon="clock"
          color="yellow"
          link="/admin/appointments?status=pending"
        />
        <StatCard
          title="오늘의 예약"
          value={stats.todayAppointments}
          icon="calendar"
          color="green"
          link="/admin/appointments?date=today"
        />
        <StatCard
          title="신규 상담"
          value={stats.newConsultations}
          icon="chat"
          color="purple"
          link="/admin/consultations"
        />
        <StatCard
          title="문의 접수"
          value={stats.totalContactSubmissions}
          icon="mail"
          color="blue"
          link="/admin/contact-submissions"
        />
        <StatCard
          title="활성 시술"
          value={stats.totalProcedures}
          icon="medical"
          color="green"
          link="/admin/procedures"
        />
        <StatCard
          title="의료진"
          value={stats.totalProviders}
          icon="user"
          color="purple"
          link="/admin/providers"
        />
        <StatCard
          title="블로그 게시물"
          value={stats.totalBlogPosts}
          icon="blog"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>빠른 작업</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Content Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>콘텐츠 개요</h2>
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <h3>미디어 콘텐츠</h3>
            <div className={styles.contentStats}>
              <div className={styles.contentStat}>
                <div className={styles.contentIcon}>
                  <Icon name="video" size="md" />
                </div>
                <div>
                  <div className={styles.contentValue}>{stats.totalVideoShorts}</div>
                  <div className={styles.contentLabel}>짧은 동영상</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <div className={styles.contentIcon}>
                  <Icon name="youtube" size="md" />
                </div>
                <div>
                  <div className={styles.contentValue}>{stats.totalYouTubeVideos}</div>
                  <div className={styles.contentLabel}>유튜브 동영상</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <div className={styles.contentIcon}>
                  <Icon name="image" size="md" />
                </div>
                <div>
                  <div className={styles.contentValue}>{stats.totalGalleryItems}</div>
                  <div className={styles.contentLabel}>갤러리 항목</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contentCard}>
            <h3>리뷰 및 기능</h3>
            <div className={styles.contentStats}>
              <div className={styles.contentStat}>
                <div className={styles.contentIcon}>
                  <Icon name="selfie" size="md" />
                </div>
                <div>
                  <div className={styles.contentValue}>{stats.totalSelfieReviews}</div>
                  <div className={styles.contentLabel}>셀피 리뷰</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <div className={styles.contentIcon}>
                  <Icon name="star" size="md" />
                </div>
                <div>
                  <div className={styles.contentValue}>{stats.totalEventBanners}</div>
                  <div className={styles.contentLabel}>이벤트 배너</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;