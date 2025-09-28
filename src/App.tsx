import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import MainLayout from "./components/MainLayout/MainLayout";
import LanguageRouter from "./components/LanguageRouter/LanguageRouter";

// Initialize i18n
import "./i18n/config";
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
import DynamicPage from "./pages/DynamicPage";
import NotFoundPage from "./pages/NotFoundPage";

// Member imports
import { MemberProvider } from "./contexts/MemberContext";
import MemberProtectedRoute from "./components/member/MemberProtectedRoute";
import {
  MemberLoginPage,
  MemberSignupPage,
  MemberMyPage,
  EmailVerificationPage,
  ForgotPasswordPage
} from "./pages/member";

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

// CMS imports
import DynamicPagesPage from "./pages/admin/DynamicPagesPage";
import DynamicPageFormPage from "./pages/admin/DynamicPageFormPage";
import HeaderNavigationPage from "./pages/admin/HeaderNavigationPage";
import PageTemplatesPage from "./pages/admin/PageTemplatesPage";

import "./styles/globals.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <MemberProvider>
          <Router>
            <LanguageRouter>
              <Routes>
            {/* Member routes */}
            <Route path="/member/login" element={<MemberLoginPage />} />
            <Route path="/member/signup" element={<MemberSignupPage />} />
            <Route path="/member/verify-email" element={<EmailVerificationPage />} />
            <Route path="/member/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/member/mypage"
              element={
                <MemberProtectedRoute>
                  <MemberMyPage />
                </MemberProtectedRoute>
              }
            />
            <Route
              path="/member/*"
              element={
                <MemberProtectedRoute>
                  <Routes>
                    <Route path="/appointments" element={<div>Member Appointments</div>} />
                    <Route path="/medical-records" element={<div>Member Medical Records</div>} />
                    <Route path="/prescriptions" element={<div>Member Prescriptions</div>} />
                    <Route path="/profile" element={<div>Member Profile</div>} />
                  </Routes>
                </MemberProtectedRoute>
              }
            />

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

                      {/* CMS Routes */}
                      <Route path="/cms/pages" element={<DynamicPagesPage />} />
                      <Route path="/cms/pages/new" element={<DynamicPageFormPage />} />
                      <Route path="/cms/pages/:id/edit" element={<DynamicPageFormPage />} />
                      <Route path="/cms/navigation" element={<HeaderNavigationPage />} />
                      <Route path="/cms/templates" element={<PageTemplatesPage />} />

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

            {/* Public routes with main layout - both with and without language prefix */}
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                        {/* Homepage - both root and language-prefixed */}
                        <Route
                          path="/"
                          element={
                            <ErrorBoundary>
                              <HomePage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/:lang/"
                          element={
                            <ErrorBoundary>
                              <HomePage />
                            </ErrorBoundary>
                          }
                        />

                        {/* Public pages with language support */}
                        <Route
                          path="/reservation"
                          element={
                            <ErrorBoundary>
                              <ReservationPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/:lang/reservation"
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
                          path="/:lang/events"
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
                          path="/:lang/about"
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
                          path="/:lang/staff"
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
                          path="/:lang/facility"
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
                          path="/:lang/procedures/:category"
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
                          path="/:lang/procedures"
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
                          path="/:lang/procedures/:category/:procedure"
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
                          path="/:lang/reviews"
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
                          path="/:lang/youtube"
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
                          path="/:lang/shorts"
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
                          path="/:lang/consultation"
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
                          path="/:lang/contact"
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
                          path="/:lang/notices"
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
                          path="/:lang/faq"
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
                          path="/:lang/model-program"
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
                        <Route
                          path="/:lang/pricing"
                          element={
                            <ErrorBoundary>
                              <PriceGuidePage />
                            </ErrorBoundary>
                          }
                        />

                        {/* 404 Page */}
                        <Route
                          path="/404"
                          element={
                            <ErrorBoundary>
                              <NotFoundPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/:lang/404"
                          element={
                            <ErrorBoundary>
                              <NotFoundPage />
                            </ErrorBoundary>
                          }
                        />

                        {/* Dynamic CMS Pages - Must be last to act as catch-all */}
                        <Route
                          path="/:slug"
                          element={
                            <ErrorBoundary>
                              <DynamicPage />
                            </ErrorBoundary>
                          }
                        />
                        <Route
                          path="/:lang/:slug"
                          element={
                            <ErrorBoundary>
                              <DynamicPage />
                            </ErrorBoundary>
                          }
                        />
                  </Routes>
                </MainLayout>
              }
            />
              </Routes>
            </LanguageRouter>
          </Router>
        </MemberProvider>
      </AdminProvider>
    </ErrorBoundary>
  );
};

export default App;
