import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ConsultationSidebar from './components/ConsultationSidebar'
import HomePage from './pages/HomePage'
import ReservationPage from './pages/ReservationPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminLayout } from './components/AdminLayout/AdminLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminProceduresPage } from './pages/AdminProceduresPage'
import { AdminBookingsPage } from './pages/AdminBookingsPage'
import { AdminGuard } from './components/AdminGuard/AdminGuard'
import './styles/globals.css'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes with main layout */}
          <Route path="/*" element={
            <div className="app">
              <a href="#main-content" className="skip-link">메인 콘텐츠로 바로가기</a>
              <Header />
              <main id="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/reservation" element={<ReservationPage />} />
                </Routes>
              </main>
              <Footer />
              <ConsultationSidebar position="right" />
            </div>
          } />

          {/* Admin login route (no layout) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected admin routes with admin layout */}
          <Route path="/admin/*" element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="procedures" element={<AdminProceduresPage />} />
            {/* Placeholder routes for now - we'll implement these pages later */}
            <Route path="consultations" element={<div>상담 요청 페이지</div>} />
            <Route path="providers" element={<div>의료진 관리 페이지</div>} />
            <Route path="content/blog" element={<div>블로그 관리 페이지</div>} />
            <Route path="content/gallery" element={<div>갤러리 관리 페이지</div>} />
            <Route path="content/banners" element={<div>배너 관리 페이지</div>} />
            <Route path="settings" element={<div>설정 페이지</div>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
