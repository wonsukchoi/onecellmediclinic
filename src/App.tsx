import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ConsultationSidebar from "./components/ConsultationSidebar";
import HomePage from "./pages/HomePage";
import ReservationPage from "./pages/ReservationPage";

import "./styles/globals.css";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
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
    </ErrorBoundary>
  );
};

export default App;
