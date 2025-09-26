import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ConsultationSidebar from './components/ConsultationSidebar'
import HomePage from './pages/HomePage'
import ReservationPage from './pages/ReservationPage'
import './styles/globals.css'

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  )
}

export default App
