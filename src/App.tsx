import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsultationSidebar from "./components/ConsultationSidebar";
import HomePage from "./pages/HomePage";
import ReservationPage from "./pages/ReservationPage";

// Admin imports
import { AdminProvider } from "./contexts/AdminContext";
import AuthGuard from "./components/admin/AuthGuard";
import AdminLayout from "./components/admin/AdminLayout";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import AppointmentsPage from "./pages/admin/AppointmentsPage";
import ConsultationsPage from "./pages/admin/ConsultationsPage";
import ContactSubmissionsPage from "./pages/admin/ContactSubmissionsPage";
import ProceduresPage from "./pages/admin/ProceduresPage";
import ProvidersPage from "./pages/admin/ProvidersPage";
import BlogPostsPage from "./pages/admin/BlogPostsPage";
import GalleryItemsPage from "./pages/admin/GalleryItemsPage";
import VideoShortsPage from "./pages/admin/VideoShortsPage";

import "./styles/globals.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <Router>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route
              path="/admin/*"
              element={
                <AuthGuard>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/appointments" element={<AppointmentsPage />} />
                      <Route path="/consultations" element={<ConsultationsPage />} />
                      <Route path="/contact-submissions" element={<ContactSubmissionsPage />} />
                      <Route path="/procedures" element={<ProceduresPage />} />
                      <Route path="/providers" element={<ProvidersPage />} />
                      <Route path="/blog-posts" element={<BlogPostsPage />} />
                      <Route path="/gallery-items" element={<GalleryItemsPage />} />
                      <Route path="/video-shorts" element={<VideoShortsPage />} />
                      {/* Additional admin routes can be added here for:
                          - procedure-categories
                          - youtube-videos
                          - selfie-reviews
                          - clinic-features
                          - differentiators
                          - event-banners
                      */}
                    </Routes>
                  </AdminLayout>
                </AuthGuard>
              }
            />

            {/* Public routes with main layout */}
            <Route
              path="/*"
              element={
                <ErrorBoundary>
                  <div className="app">
                    <a href="#main-content" className="skip-link">
                      메인 콘텐츠로 바로가기
                    </a>
                    <ErrorBoundary>
                      <Header />
                    </ErrorBoundary>
                    <main id="main-content">
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <ErrorBoundary>
                              <HomePage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/reservation"
                          element={
                            <ErrorBoundary>
                              <ReservationPage />
                            </ErrorBoundary>
                          }
                        />
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
              }
            />
          </Routes>
        </Router>
      </AdminProvider>
    </ErrorBoundary>
  );
};

export default App;
