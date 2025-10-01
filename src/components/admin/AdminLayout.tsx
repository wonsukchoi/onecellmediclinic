import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Icon, type IconName } from '../icons';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, signOut, stats } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navigationItems = [
    {
      label: '대시보드',
      path: '/admin',
      icon: 'dashboard' as IconName,
    },
    {
      label: '예약 관리',
      path: '/admin/appointments',
      icon: 'calendar' as IconName,
      badge: stats?.pendingAppointments || 0,
    },
    {
      label: '상담 관리',
      path: '/admin/consultations',
      icon: 'chat' as IconName,
      badge: stats?.newConsultations || 0,
    },
    {
      label: '문의 접수',
      path: '/admin/contact-submissions',
      icon: 'mail' as IconName,
      badge: stats?.newContactSubmissions || 0,
    },
    {
      label: '콘텐츠 관리',
      path: '',
      icon: 'blog' as IconName,
      children: [
        { label: '블로그 게시물', path: '/admin/blog-posts' },
        { label: '시술 항목', path: '/admin/procedures' },
        { label: '시술 카테고리', path: '/admin/procedure-categories' },
        { label: '의료진 관리', path: '/admin/providers' },
        { label: '갤러리 관리', path: '/admin/gallery-items' },
      ],
    },
    {
      label: '미디어 및 리뷰',
      path: '',
      icon: 'video' as IconName,
      children: [
        { label: '원셀 쇼츠', path: '/admin/video-shorts' },
        { label: '유튜브 동영상', path: '/admin/youtube-videos' },
        { label: '셀피 리뷰', path: '/admin/selfie-reviews' },
      ],
    },
    {
      label: '사이트 기능',
      path: '',
      icon: 'settings' as IconName,
      children: [
        { label: '클리닉 특징', path: '/admin/clinic-features' },
        { label: '차별화 요소', path: '/admin/differentiators' },
        { label: '이벤트 배너', path: '/admin/event-banners' },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Icon name="medical" size="lg" className={styles.logoIcon} />
            {!sidebarCollapsed && <span className={styles.logoText}>원셀 관리자</span>}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Icon name={sidebarCollapsed ? 'chevronRight' : 'chevronLeft'} size="sm" />
          </button>
        </div>

        <nav className={styles.navigation}>
          {navigationItems.map((item, index) => {
            if (item.children) {
              return (
                <div key={index} className={styles.navGroup}>
                  <div className={styles.navGroupLabel}>
                    <Icon name={item.icon} size="sm" className={styles.navIcon} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <div className={styles.navGroupItems}>
                      {item.children.map((child, childIndex) => (
                        <Link
                          key={childIndex}
                          to={child.path}
                          className={`${styles.navItem} ${styles.navSubItem} ${
                            isActive(child.path) ? styles.active : ''
                          }`}
                        >
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                to={item.path}
                className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              >
                <Icon name={item.icon} size="sm" className={styles.navIcon} />
                {!sidebarCollapsed && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={styles.navBadge}>{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>관리자 패널</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || user?.email}</span>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                로그아웃
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;