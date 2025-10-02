import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useFeatures } from "../../contexts/FeaturesContext";
import HorizontalScroll from "../../components/HorizontalScroll";
import styles from "./VideoShortsSection.module.css";

interface VideoShort {
  id: number;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  view_count: number;
  category: string;
}

interface VideoShortsProps {
  title?: string;
  subtitle?: string;
  showCategories?: boolean;
}

const VideoShortsSection: React.FC<VideoShortsProps> = ({
  title,
  subtitle,
  showCategories = true,
}) => {
  const { t } = useTranslation();
  const { getVideoShorts } = useFeatures();
  const [videos, setVideos] = useState<VideoShort[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoShort[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { key: "all", label: t("videoShorts.categories.all") },
    { key: "introduction", label: t("videoShorts.categories.introduction") },
    { key: "safety", label: t("videoShorts.categories.safety") },
    { key: "recovery", label: t("videoShorts.categories.recovery") },
    { key: "testimonial", label: t("videoShorts.categories.testimonial") },
    { key: "procedure", label: t("videoShorts.categories.procedure") },
  ];

  useEffect(() => {
    fetchVideos();
  }, []);

  console.log("loading", loading);

  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredVideos(videos.slice(0, 6));
    } else {
      setFilteredVideos(
        videos.filter((video) => video.category === activeCategory).slice(0, 6)
      );
    }
  }, [videos, activeCategory]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getVideoShorts();
      setVideos(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError(t("videoShorts.error.fetchFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>{t("videoShorts.loading")}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchVideos} className={styles.retryButton}>
              {t("videoShorts.error.retry")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title || t("videoShorts.title")}</h2>
          <p className={styles.subtitle}>
            {subtitle || t("videoShorts.subtitle")}
          </p>
        </div>

        {showCategories && (
          <div className={styles.categoryFilter}>
            {categories.map((category) => (
              <button
                key={category.key}
                className={`${styles.categoryButton} ${
                  activeCategory === category.key ? styles.active : ""
                }`}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        <HorizontalScroll
          className={styles.horizontalScrollContainer}
          showIndicators={false}
          showNavigation={false} /* Hide navigation arrows */
          itemWidth={230}
          gap={16}
          visibleItems={{
            desktop: 6,
            tablet: 3,
            mobile: 1.5,
          }}
          autoScroll={true}
          autoScrollInterval={4000}
          pauseOnHover={true}
          pauseOnInteraction={true}
        >
          {filteredVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoWrapper}>
                <img
                  src={
                    video.thumbnail_url || "https://via.placeholder.com/400x500"
                  }
                  alt={video.title}
                  className={styles.video}
                />


                <div className={styles.videoInfo}>
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                  {video.description && (
                    <p className={styles.videoDescription}>
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </HorizontalScroll>

        {filteredVideos.length === 0 && (
          <div className={styles.noVideos}>
            <p>{t("videoShorts.noVideos")}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoShortsSection;
