import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
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
      label: 'Dashboard',
      path: '/admin',
      icon: '📊',
    },
    {
      label: 'Appointments',
      path: '/admin/appointments',
      icon: '📅',
      badge: stats?.pendingAppointments || 0,
    },
    {
      label: 'Consultations',
      path: '/admin/consultations',
      icon: '💬',
      badge: stats?.newConsultations || 0,
    },
    {
      label: 'Contact Submissions',
      path: '/admin/contact-submissions',
      icon: '📧',
      badge: stats?.newContactSubmissions || 0,
    },
    {
      label: 'Content Management',
      path: '',
      icon: '📝',
      children: [
        { label: 'Blog Posts', path: '/admin/blog-posts' },
        { label: 'Procedures', path: '/admin/procedures' },
        { label: 'Procedure Categories', path: '/admin/procedure-categories' },
        { label: 'Providers', path: '/admin/providers' },
        { label: 'Gallery', path: '/admin/gallery-items' },
      ],
    },
    {
      label: 'Media & Reviews',
      path: '',
      icon: '🎬',
      children: [
        { label: 'Video Shorts', path: '/admin/video-shorts' },
        { label: 'YouTube Videos', path: '/admin/youtube-videos' },
        { label: 'Selfie Reviews', path: '/admin/selfie-reviews' },
      ],
    },
    {
      label: 'Site Features',
      path: '',
      icon: '⚙️',
      children: [
        { label: 'Clinic Features', path: '/admin/clinic-features' },
        { label: 'Differentiators', path: '/admin/differentiators' },
        { label: 'Event Banners', path: '/admin/event-banners' },
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
            <span className={styles.logoIcon}>🏥</span>
            {!sidebarCollapsed && <span className={styles.logoText}>OneCell Admin</span>}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav className={styles.navigation}>
          {navigationItems.map((item, index) => {
            if (item.children) {
              return (
                <div key={index} className={styles.navGroup}>
                  <div className={styles.navGroupLabel}>
                    <span className={styles.navIcon}>{item.icon}</span>
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
                <span className={styles.navIcon}>{item.icon}</span>
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
            <h1 className={styles.pageTitle}>Admin Panel</h1>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || user?.email}</span>
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                Sign Out
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