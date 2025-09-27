import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsultationSidebar from "./components/ConsultationSidebar";
import HomePage from "./pages/HomePage";
import ReservationPage from "./pages/ReservationPage";
import EventsGalleryPage from "./pages/EventsGalleryPage";
import AboutPage from "./pages/AboutPage";
import MedicalStaffPage from "./pages/MedicalStaffPage";
import FacilityTourPage from "./pages/FacilityTourPage";
import ProcedureCategoryPage from "./pages/ProcedureCategoryPage";

// New public pages
import ProceduresOverviewPage from "./pages/ProceduresOverviewPage";
import ProcedureDetailPage from "./pages/ProcedureDetailPage";
import SelfieReviewsPagePublic from "./pages/SelfieReviewsPage";
import YouTubeChannelPage from "./pages/YouTubeChannelPage";
import VideoShortsPagePublic from "./pages/VideoShortsPage";
import OnlineConsultationPage from "./pages/OnlineConsultationPage";
import ContactPage from "./pages/ContactPage";
import NoticesPage from "./pages/NoticesPage";
import FAQPage from "./pages/FAQPage";
import ModelProgramPage from "./pages/ModelProgramPage";
import PriceGuidePage from "./pages/PriceGuidePage";

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
import YouTubeVideosPage from "./pages/admin/YouTubeVideosPage";
import SelfieReviewsPage from "./pages/admin/SelfieReviewsPage";
import VideoShortsFormPage from "./pages/admin/VideoShortsFormPage";
import YouTubeVideosFormPage from "./pages/admin/YouTubeVideosFormPage";
import SelfieReviewsFormPage from "./pages/admin/SelfieReviewsFormPage";

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
                      <Route path="/video-shorts/new" element={<VideoShortsFormPage />} />
                      <Route path="/video-shorts/:id/edit" element={<VideoShortsFormPage />} />
                      <Route path="/youtube-videos" element={<YouTubeVideosPage />} />
                      <Route path="/youtube-videos/new" element={<YouTubeVideosFormPage />} />
                      <Route path="/youtube-videos/:id/edit" element={<YouTubeVideosFormPage />} />
                      <Route path="/selfie-reviews" element={<SelfieReviewsPage />} />
                      <Route path="/selfie-reviews/new" element={<SelfieReviewsFormPage />} />
                      <Route path="/selfie-reviews/:id/edit" element={<SelfieReviewsFormPage />} />
                      {/* Additional admin routes can be added here for:
                          - procedure-categories
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
                        <Route
                          path="/events"
                          element={
                            <ErrorBoundary>
                              <EventsGalleryPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/about"
                          element={
                            <ErrorBoundary>
                              <AboutPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/staff"
                          element={
                            <ErrorBoundary>
                              <MedicalStaffPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/facility"
                          element={
                            <ErrorBoundary>
                              <FacilityTourPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/procedures/:category"
                          element={
                            <ErrorBoundary>
                              <ProcedureCategoryPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/procedures"
                          element={
                            <ErrorBoundary>
                              <ProceduresOverviewPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/procedures/:category/:procedure"
                          element={
                            <ErrorBoundary>
                              <ProcedureDetailPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/reviews"
                          element={
                            <ErrorBoundary>
                              <SelfieReviewsPagePublic />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/youtube"
                          element={
                            <ErrorBoundary>
                              <YouTubeChannelPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/shorts"
                          element={
                            <ErrorBoundary>
                              <VideoShortsPagePublic />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/consultation"
                          element={
                            <ErrorBoundary>
                              <OnlineConsultationPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/contact"
                          element={
                            <ErrorBoundary>
                              <ContactPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/notices"
                          element={
                            <ErrorBoundary>
                              <NoticesPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/faq"
                          element={
                            <ErrorBoundary>
                              <FAQPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/model-program"
                          element={
                            <ErrorBoundary>
                              <ModelProgramPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/pricing"
                          element={
                            <ErrorBoundary>
                              <PriceGuidePage />
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
