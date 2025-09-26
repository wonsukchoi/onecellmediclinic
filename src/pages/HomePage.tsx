import React from 'react'
import HeroSection from '../sections/HeroSection'
import ContactSection from '../sections/ContactSection'

// Placeholder components - will be created later
const ShortsSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: 'white' }}>Shorts Section - Coming Soon</div>
const DifferentiatorsSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>Differentiators Section - Coming Soon</div>
const EventsSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: 'white' }}>Events Section - Coming Soon</div>
const ReviewsSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>Reviews Section - Coming Soon</div>
const YoutubeSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: 'white' }}>YouTube Section - Coming Soon</div>
const FeaturesSection = () => <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc' }}>Features Section - Coming Soon</div>

const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
      <ShortsSection />
      <DifferentiatorsSection />
      <EventsSection />
      <ReviewsSection />
      <YoutubeSection />
      <FeaturesSection />
      <ContactSection />
    </main>
  )
}

export default HomePage