import React, { useState, useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './VideoShortsSection.module.css'
import 'swiper/swiper-bundle.css'

interface VideoShort {
  id: number
  title: string
  video_url: string
  thumbnail_url?: string
  description?: string
  view_count: number
  category: string
}

interface VideoShortsProps {
  title?: string
  subtitle?: string
  showCategories?: boolean
  maxItems?: number
}

const VideoShortsSection: React.FC<VideoShortsProps> = ({
  title = "비디오 쇼츠",
  subtitle = "짧고 임팩트있는 영상으로 만나는 원셀 메디의원",
  showCategories = true,
  maxItems = 6
}) => {
  const [videos, setVideos] = useState<VideoShort[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoShort[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_playingVideo, setPlayingVideo] = useState<number | null>(null)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement }>({})

  const categories = [
    { key: 'all', label: '전체' },
    { key: 'introduction', label: '소개' },
    { key: 'safety', label: '안전' },
    { key: 'recovery', label: '회복' },
    { key: 'testimonial', label: '후기' },
    { key: 'procedure', label: '시술' }
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredVideos(videos.slice(0, maxItems))
    } else {
      setFilteredVideos(videos.filter(video => video.category === activeCategory).slice(0, maxItems))
    }
  }, [videos, activeCategory, maxItems])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getVideoShorts()
      setVideos(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('영상을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoPlay = (videoId: number) => {
    // Pause all other videos
    Object.keys(videoRefs.current).forEach(id => {
      const video = videoRefs.current[parseInt(id)]
      if (video && parseInt(id) !== videoId) {
        video.pause()
      }
    })
    setPlayingVideo(videoId)

    // Increment view count
    incrementViewCount(videoId)
  }

  const handleVideoRef = (el: HTMLVideoElement | null, videoId: number) => {
    if (el) {
      videoRefs.current[videoId] = el
    }
  }

  const incrementViewCount = async (videoId: number) => {
    try {
      await ContentFeaturesService.incrementVideoShortsViews(videoId)
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>영상을 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchVideos} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {showCategories && (
          <div className={styles.categoryFilter}>
            {categories.map(category => (
              <button
                key={category.key}
                className={`${styles.categoryButton} ${
                  activeCategory === category.key ? styles.active : ''
                }`}
                onClick={() => setActiveCategory(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.videosContainer}>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className={styles.swiper}
          >
            {filteredVideos.map((video) => (
              <SwiperSlide key={video.id}>
                <div className={styles.videoCard}>
                  <div className={styles.videoWrapper}>
                    <video
                      ref={(el) => handleVideoRef(el, video.id)}
                      className={styles.video}
                      poster={video.thumbnail_url}
                      controls
                      preload="metadata"
                      onPlay={() => handleVideoPlay(video.id)}
                      onPause={() => setPlayingVideo(null)}
                    >
                      <source src={video.video_url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    <div className={styles.videoOverlay}>
                      <div className={styles.playButton}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M8 5v14l11-7z"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className={styles.videoInfo}>
                    <h3 className={styles.videoTitle}>{video.title}</h3>
                    {video.description && (
                      <p className={styles.videoDescription}>{video.description}</p>
                    )}
                    <div className={styles.videoMeta}>
                      <span className={styles.viewCount}>
                        조회수 {formatViewCount(video.view_count)}
                      </span>
                      <span className={styles.category}>{video.category}</span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {filteredVideos.length === 0 && (
          <div className={styles.noVideos}>
            <p>선택한 카테고리에 영상이 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default VideoShortsSection