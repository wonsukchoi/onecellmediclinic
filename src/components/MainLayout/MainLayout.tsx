import React from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import Header from '../Header';
import Footer from '../Footer';
import ConsultationSidebar from '../ConsultationSidebar';
import StickyScrollBar from '../StickyScrollBar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();

  return (
    <ErrorBoundary>
      <div id="top" className="app">
        <a href="#main-content" className="skip-link">
          {t('header.skip_to_main')}
        </a>
        <ErrorBoundary>
          <Header />
        </ErrorBoundary>
        <main id="main-content">
          {children}
        </main>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
        <ErrorBoundary>
          <ConsultationSidebar position="right" />
        </ErrorBoundary>
        <ErrorBoundary>
          <StickyScrollBar />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default MainLayout;