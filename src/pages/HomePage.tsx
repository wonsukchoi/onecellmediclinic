import React from "react";
import HeroSection from "../sections/HeroSection";
import ContactSection from "../sections/ContactSection";
import VideoShortsSection from "../sections/VideoShortsSection";
import ClinicFeaturesSection from "../sections/ClinicFeaturesSection";
import EventsSection from "../sections/EventsSection";
import SelfieReviewsSection from "../sections/SelfieReviewsSection";
import YouTubeSection from "../sections/YouTubeSection";
import DifferentiatorsSection from "../sections/DifferentiatorsSection";
import StickyScrollBar from "../components/StickyScrollBar";

const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
      <VideoShortsSection />
      <ClinicFeaturesSection />
      <EventsSection />
      <SelfieReviewsSection />
      <YouTubeSection />
      <StickyScrollBar />
    </main>
  );
};

export default HomePage;
