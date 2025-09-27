import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './DashboardPage.module.css';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  link?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, link }) => {
  const content = (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.statIcon}>
        <span>{icon}</span>
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statValue}>{value.toLocaleString()}</h3>
        <p className={styles.statTitle}>{title}</p>
        {change !== undefined && (
          <div className={styles.statChange}>
            <span className={change >= 0 ? styles.positive : styles.negative}>
              {change >= 0 ? '↗' : '↘'} {Math.abs(change)}
            </span>
            <span className={styles.changeText}>vs last month</span>
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
  icon: string;
  link: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, link, color }) => (
  <Link to={link} className={`${styles.quickAction} ${styles[color]}`}>
    <div className={styles.actionIcon}>
      <span>{icon}</span>
    </div>
    <div className={styles.actionContent}>
      <h4 className={styles.actionTitle}>{title}</h4>
      <p className={styles.actionDescription}>{description}</p>
    </div>
    <div className={styles.actionArrow}>→</div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const { stats, refreshStats } = useAdmin();

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  if (!stats) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Add New Procedure',
      description: 'Create a new medical procedure',
      icon: '🏥',
      link: '/admin/procedures/new',
      color: 'blue' as const,
    },
    {
      title: 'Add Provider',
      description: 'Register a new medical provider',
      icon: '👨‍⚕️',
      link: '/admin/providers/new',
      color: 'green' as const,
    },
    {
      title: 'Create Blog Post',
      description: 'Write a new blog article',
      icon: '📝',
      link: '/admin/blog-posts/new',
      color: 'purple' as const,
    },
    {
      title: 'Upload Gallery Item',
      description: 'Add before/after photos',
      icon: '📸',
      link: '/admin/gallery-items/new',
      color: 'blue' as const,
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <button
          onClick={refreshStats}
          className={styles.refreshButton}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon="📅"
          color="blue"
          link="/admin/appointments"
        />
        <StatCard
          title="Pending Appointments"
          value={stats.pendingAppointments}
          icon="⏰"
          color="yellow"
          link="/admin/appointments?status=pending"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="📋"
          color="green"
          link="/admin/appointments?date=today"
        />
        <StatCard
          title="New Consultations"
          value={stats.newConsultations}
          icon="💬"
          color="purple"
          link="/admin/consultations"
        />
        <StatCard
          title="Contact Submissions"
          value={stats.totalContactSubmissions}
          icon="📧"
          color="blue"
          link="/admin/contact-submissions"
        />
        <StatCard
          title="Active Procedures"
          value={stats.totalProcedures}
          icon="🏥"
          color="green"
          link="/admin/procedures"
        />
        <StatCard
          title="Medical Providers"
          value={stats.totalProviders}
          icon="👨‍⚕️"
          color="purple"
          link="/admin/providers"
        />
        <StatCard
          title="Blog Posts"
          value={stats.totalBlogPosts}
          icon="📝"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Content Overview */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Content Overview</h2>
        <div className={styles.contentGrid}>
          <div className={styles.contentCard}>
            <h3>Media Content</h3>
            <div className={styles.contentStats}>
              <div className={styles.contentStat}>
                <span className={styles.contentIcon}>🎬</span>
                <div>
                  <div className={styles.contentValue}>{stats.totalVideoShorts}</div>
                  <div className={styles.contentLabel}>Video Shorts</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <span className={styles.contentIcon}>📺</span>
                <div>
                  <div className={styles.contentValue}>{stats.totalYouTubeVideos}</div>
                  <div className={styles.contentLabel}>YouTube Videos</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <span className={styles.contentIcon}>📸</span>
                <div>
                  <div className={styles.contentValue}>{stats.totalGalleryItems}</div>
                  <div className={styles.contentLabel}>Gallery Items</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contentCard}>
            <h3>Reviews & Features</h3>
            <div className={styles.contentStats}>
              <div className={styles.contentStat}>
                <span className={styles.contentIcon}>🤳</span>
                <div>
                  <div className={styles.contentValue}>{stats.totalSelfieReviews}</div>
                  <div className={styles.contentLabel}>Selfie Reviews</div>
                </div>
              </div>
              <div className={styles.contentStat}>
                <span className={styles.contentIcon}>⭐</span>
                <div>
                  <div className={styles.contentValue}>{stats.totalEventBanners}</div>
                  <div className={styles.contentLabel}>Event Banners</div>
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