import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/supabase';
import type { YouTubeVideo } from '../types/admin';
import { Icon } from '../components/icons';
import styles from './YouTubeChannelPage.module.css';

const YouTubeChannelPage: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'procedure', label: '시술 과정' },
    { value: 'consultation', label: '상담' },
    { value: 'testimonial', label: '후기' },
    { value: 'education', label: '교육' }
  ];

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCategory]);

  const loadVideos = async (pageNum = 1, append = false) => {
    const result = await AdminService.getAll<YouTubeVideo>('youtube_videos', {
      page: pageNum,
      limit: 12,
      filters: { active: true },
      sort: { field: 'order_index', direction: 'asc' }
    });

    if (result.success && result.data) {
      const newVideos = result.data.data;

      if (append) {
        setVideos(prev => [...prev, ...newVideos]);
      } else {
        setVideos(newVideos);
      }

      setHasMore(result.data.page < result.data.totalPages);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadVideos(nextPage, true);
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
  };

  const openVideoModal = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
  };

  const formatDuration = (seconds: number | undefined) => {
    if (!seconds) return '';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number | undefined) => {
    if (!count) return '0';

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>YouTube 채널</h1>
          <p className={styles.heroDescription}>
            원셀의료의원의 다양한 영상 콘텐츠를 만나보세요
          </p>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={styles.filtersContent}>
          <h2 className={styles.filtersTitle}>카테고리별 영상</h2>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.filterButton} ${
                  selectedCategory === category.value ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.videos}>
        <div className={styles.videosContent}>
          {filteredVideos.length === 0 ? (
            <div className={styles.noVideos}>
              <Icon name="video" size={48} />
              <p>해당 카테고리의 영상이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.videosGrid}>
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className={styles.videoCard}
                    onClick={() => openVideoModal(video)}
                  >
                    <div className={styles.videoThumbnail}>
                      <img
                        src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        loading="lazy"
                      />
                      <div className={styles.playOverlay}>
                        <Icon name="video" size={32} />
                      </div>
                      {video.duration_seconds && (
                        <div className={styles.duration}>
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}
                      {video.featured && (
                        <div className={styles.featuredBadge}>
                          <Icon name="star" size={14} />
                          인기
                        </div>
                      )}
                    </div>

                    <div className={styles.videoContent}>
                      <h3 className={styles.videoTitle}>{video.title}</h3>
                      {video.description && (
                        <p className={styles.videoDescription}>
                          {video.description}
                        </p>
                      )}

                      <div className={styles.videoMeta}>
                        <span className={styles.category}>
                          {categories.find(cat => cat.value === video.category)?.label || video.category}
                        </span>
                        {video.view_count && (
                          <span className={styles.viewCount}>
                            조회수 {formatViewCount(video.view_count)}회
                          </span>
                        )}
                        {video.published_at && (
                          <span className={styles.publishDate}>
                            {new Date(video.published_at).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadMore}>
                  <button onClick={loadMore} className={styles.loadMoreButton}>
                    더 보기
                    <Icon name="chevronDown" size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selectedVideo && (
        <div className={styles.videoModal} onClick={closeVideoModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeVideoModal}>
              <Icon name="close" size={24} />
            </button>

            <div className={styles.modalVideo}>
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.youtube_id)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className={styles.modalDetails}>
              <h3 className={styles.modalTitle}>{selectedVideo.title}</h3>
              {selectedVideo.description && (
                <p className={styles.modalDescription}>
                  {selectedVideo.description}
                </p>
              )}

              <div className={styles.modalMeta}>
                <span className={styles.category}>
                  {categories.find(cat => cat.value === selectedVideo.category)?.label || selectedVideo.category}
                </span>
                {selectedVideo.view_count && (
                  <span className={styles.viewCount}>
                    조회수 {formatViewCount(selectedVideo.view_count)}회
                  </span>
                )}
                {selectedVideo.published_at && (
                  <span className={styles.publishDate}>
                    게시일: {new Date(selectedVideo.published_at).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </div>

              <div className={styles.modalActions}>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.youtubeLink}
                >
                  <Icon name="view" size={16} />
                  YouTube에서 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeChannelPage;