import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { AdminProvider } from '../../contexts/AdminContext'
import styles from './AdminLayout.module.css'

export const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <AdminProvider>
      <div className={styles.adminLayout}>
        <AdminSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
          <AdminHeader onToggleSidebar={toggleSidebar} />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </AdminProvider>
  )
}