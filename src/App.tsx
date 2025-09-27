import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'
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
import { AdminVideoShortsPage } from './pages/AdminVideoShortsPage'
import { AdminFeaturesPage } from './pages/AdminFeaturesPage'
import { AdminEventsPage } from './pages/AdminEventsPage'
import { AdminConsultationsPage } from './pages/AdminConsultationsPage'
import { AdminProvidersPage } from './pages/AdminProvidersPage'
import { AdminBlogPage } from './pages/AdminBlogPage'
import { AdminGalleryPage } from './pages/AdminGalleryPage'
import { AdminBannersPage } from './pages/AdminBannersPage'
import { AdminSelfieReviewsPage } from './pages/AdminSelfieReviewsPage'
import { AdminYouTubeVideosPage } from './pages/AdminYouTubeVideosPage'
import { AdminDifferentiatorsPage } from './pages/AdminDifferentiatorsPage'
import { AdminContentIndexPage } from './pages/AdminContentIndexPage'
import { AdminGuard } from './components/AdminGuard/AdminGuard'
import './styles/globals.css'

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes with main layout */}
            <Route path="/*" element={
              <ErrorBoundary>
                <div className="app">
                  <a href="#main-content" className="skip-link">메인 콘텐츠로 바로가기</a>
                  <ErrorBoundary>
                    <Header />
                  </ErrorBoundary>
                  <main id="main-content">
                    <Routes>
                      <Route path="/" element={
                        <ErrorBoundary>
                          <HomePage />
                        </ErrorBoundary>
                      } />
                      <Route path="/reservation" element={
                        <ErrorBoundary>
                          <ReservationPage />
                        </ErrorBoundary>
                      } />
                    </Routes>
                  </main>
                  <ErrorBoundary>
                    <Footer />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <ConsultationSidebar position="right" />
                  </ErrorBoundary>
                </div>
              </ErrorBoundary>
            } />

            {/* Admin login route (no layout) */}
            <Route path="/admin/login" element={
              <ErrorBoundary>
                <AdminLoginPage />
              </ErrorBoundary>
            } />

            {/* Protected admin routes with admin layout */}
            <Route path="/admin" element={
              <ErrorBoundary>
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              </ErrorBoundary>
            }>
              <Route index element={
                <ErrorBoundary>
                  <AdminDashboard />
                </ErrorBoundary>
              } />
              <Route path="bookings" element={
                <ErrorBoundary>
                  <AdminBookingsPage />
                </ErrorBoundary>
              } />
              <Route path="procedures" element={
                <ErrorBoundary>
                  <AdminProceduresPage />
                </ErrorBoundary>
              } />
              <Route path="content" element={
                <ErrorBoundary>
                  <AdminContentIndexPage />
                </ErrorBoundary>
              } />
              <Route path="content/video-shorts" element={
                <ErrorBoundary>
                  <AdminVideoShortsPage />
                </ErrorBoundary>
              } />
              <Route path="content/features" element={
                <ErrorBoundary>
                  <AdminFeaturesPage />
                </ErrorBoundary>
              } />
              <Route path="content/events" element={
                <ErrorBoundary>
                  <AdminEventsPage />
                </ErrorBoundary>
              } />
              <Route path="consultations" element={
                <ErrorBoundary>
                  <AdminConsultationsPage />
                </ErrorBoundary>
              } />
              <Route path="providers" element={
                <ErrorBoundary>
                  <AdminProvidersPage />
                </ErrorBoundary>
              } />
              <Route path="content/blog" element={
                <ErrorBoundary>
                  <AdminBlogPage />
                </ErrorBoundary>
              } />
              <Route path="content/gallery" element={
                <ErrorBoundary>
                  <AdminGalleryPage />
                </ErrorBoundary>
              } />
              <Route path="content/banners" element={
                <ErrorBoundary>
                  <AdminBannersPage />
                </ErrorBoundary>
              } />
              <Route path="content/selfie-reviews" element={
                <ErrorBoundary>
                  <AdminSelfieReviewsPage />
                </ErrorBoundary>
              } />
              <Route path="content/youtube-videos" element={
                <ErrorBoundary>
                  <AdminYouTubeVideosPage />
                </ErrorBoundary>
              } />
              <Route path="content/differentiators" element={
                <ErrorBoundary>
                  <AdminDifferentiatorsPage />
                </ErrorBoundary>
              } />
              <Route path="settings" element={
                <ErrorBoundary>
                  <div>설정 페이지</div>
                </ErrorBoundary>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
