import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/supabase';
import type { VideoShort } from '../types/admin';
import { Icon } from '../components/icons';
import styles from './VideoShortsPage.module.css';

// Add global style for filter buttons
const globalStyle = document.createElement('style');
globalStyle.innerHTML = `
  .filter-button {
    border: none !important;
    background: transparent !important;
    background-color: transparent !important;
    color: #000 !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    outline: none !important;
  }
`;
document.head.appendChild(globalStyle);

const VideoShortsPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoShort[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'before-after', label: '전후 비교' },
    { value: 'procedure', label: '시술 과정' },
    { value: 'tips', label: '꿀팁' },
    { value: 'testimonial', label: '후기' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCategory]);

  const loadVideos = async () => {
    const result = await AdminService.getAll<VideoShort>('video_shorts', {
      filters: { active: true },
      sort: { field: 'order_index', direction: 'asc' }
    });

    if (result.success && result.data) {
      setVideos(result.data.data);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    if (selectedCategory === 'all') {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video =>
        video.category === selectedCategory
      );
      setFilteredVideos(filtered);
    }
    setCurrentIndex(0);
  };

  const goToNext = () => {
    if (currentIndex < filteredVideos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '';
    return `${seconds}초`;
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  if (filteredVideos.length === 0) {
    return (
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>원셀 쇼츠</h1>
            <p className={styles.heroDescription}>
              짧고 임팩트 있는 영상으로 만나는 원셀의료의원
            </p>
          </div>
        </section>

        <section className={styles.filters}>
          <div className={styles.filtersContent}>
            <div className={styles.filterButtons} style={{ display: 'flex', width: '100%', maxWidth: '600px', margin: '0 auto', gap: 0 }}>
              {categories.map((category) => (
                <button
                  key={category.value}
                  className="filter-button"
                  onClick={() => setSelectedCategory(category.value)}
                  style={{
                    border: 'none !important',
                    background: 'transparent !important',
                    backgroundColor: 'transparent !important',
                    color: '#000 !important',
                    boxShadow: 'none !important',
                    borderRadius: '0 !important',
                    padding: '10px 16px !important',
                    fontWeight: selectedCategory === category.value ? '600 !important' : '500 !important',
                    outline: 'none !important',
                    textDecoration: 'none !important',
                    appearance: 'none !important',
                    WebkitAppearance: 'none !important',
                    MozAppearance: 'none !important'
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.noVideos}>
          <Icon name="video" size={48} />
          <p>해당 카테고리의 영상이 없습니다.</p>
        </div>
      </div>
    );
  }

  const currentVideo = filteredVideos[currentIndex];

  return (
    <div className={styles.container} onKeyDown={handleKeyDown} tabIndex={0}>
      <section className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>원셀 쇼츠</h1>
          <div className={styles.filterButtons} style={{ display: 'flex', width: '100%', maxWidth: '600px', margin: '0 auto', gap: 0 }}>
            {categories.map((category) => (
              <button
                key={category.value}
                className="filter-button"
                onClick={() => setSelectedCategory(category.value)}
                style={{
                  border: 'none !important',
                  background: 'transparent !important',
                  backgroundColor: 'transparent !important',
                  color: '#000 !important',
                  boxShadow: 'none !important',
                  borderRadius: '0 !important',
                  padding: '10px 16px !important',
                  fontWeight: selectedCategory === category.value ? '600 !important' : '500 !important',
                  outline: 'none !important',
                  textDecoration: 'none !important',
                  appearance: 'none !important',
                  WebkitAppearance: 'none !important',
                  MozAppearance: 'none !important'
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.videoSection}>
        <div className={styles.videoContainer}>
          <div className={styles.videoPlayer}>
            <video
              key={currentVideo.id}
              src={currentVideo.video_url}
              poster={currentVideo.thumbnail_url}
              controls
              autoPlay
              loop
              muted
              className={styles.video}
            />

            <div className={styles.videoOverlay}>
              <div className={styles.videoInfo}>
                <h2 className={styles.videoTitle}>{currentVideo.title}</h2>
                {currentVideo.description && (
                  <p className={styles.videoDescription}>
                    {currentVideo.description}
                  </p>
                )}

                <div className={styles.videoMeta}>
                  <span className={styles.category}>
                    {categories.find(cat => cat.value === currentVideo.category)?.label || currentVideo.category}
                  </span>
                  <span className={styles.viewCount}>
                    <Icon name="view" size={14} />
                    {formatViewCount(currentVideo.view_count)}
                  </span>
                  {currentVideo.duration_seconds && (
                    <span className={styles.duration}>
                      {formatDuration(currentVideo.duration_seconds)}
                    </span>
                  )}
                  {currentVideo.featured && (
                    <span className={styles.featuredBadge}>
                      <Icon name="star" size={14} />
                      인기
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.navigation}>
            <button
              className={styles.navButton}
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              <Icon name="chevronUp" size={24} />
            </button>

            <div className={styles.progress}>
              <span className={styles.progressText}>
                {currentIndex + 1} / {filteredVideos.length}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    height: `${((currentIndex + 1) / filteredVideos.length) * 100}%`
                  }}
                />
              </div>
            </div>

            <button
              className={styles.navButton}
              onClick={goToNext}
              disabled={currentIndex === filteredVideos.length - 1}
            >
              <Icon name="chevronDown" size={24} />
            </button>
          </div>
        </div>
      </section>

      <section className={styles.playlist}>
        <div className={styles.playlistContent}>
          <h3 className={styles.playlistTitle}>재생목록</h3>
          <div className={styles.playlistGrid}>
            {filteredVideos.map((video, index) => (
              <div
                key={video.id}
                className={`${styles.playlistItem} ${
                  index === currentIndex ? styles.active : ''
                }`}
                onClick={() => goToIndex(index)}
              >
                <div className={styles.playlistThumbnail}>
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} />
                  ) : (
                    <div className={styles.placeholderThumbnail}>
                      <Icon name="video" size={24} />
                    </div>
                  )}
                  {video.duration_seconds && (
                    <span className={styles.playlistDuration}>
                      {formatDuration(video.duration_seconds)}
                    </span>
                  )}
                </div>
                <div className={styles.playlistInfo}>
                  <h4 className={styles.playlistVideoTitle}>{video.title}</h4>
                  <div className={styles.playlistMeta}>
                    <span className={styles.playlistCategory}>
                      {categories.find(cat => cat.value === video.category)?.label}
                    </span>
                    <span className={styles.playlistViews}>
                      {formatViewCount(video.view_count)}회
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VideoShortsPage;