import React, { useState, useEffect, useRef } from 'react'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './YouTubeSection.module.css'

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubeVideo {
  id: number
  title: string
  youtube_id: string
  description?: string
  category: string
  featured: boolean
  view_count: number
  thumbnail_url?: string
  duration_seconds?: number
}

interface YouTubeSectionProps {
  title?: string
  subtitle?: string
  showCategories?: boolean
  maxItems?: number
}

const YouTubeSection: React.FC<YouTubeSectionProps> = ({
  title = "YouTube 영상",
  subtitle = "원셀 메디클리닉의 다양한 정보와 노하우를 영상으로 만나보세요",
  showCategories = true,
  maxItems = 8
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [filteredVideos, setFilteredVideos] = useState<YouTubeVideo[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const playerRefs = useRef<{ [key: string]: any }>({})

  const categories = [
    { key: 'all', label: '전체' },
    { key: 'facility', label: '시설 투어' },
    { key: 'interview', label: '전문의 인터뷰' },
    { key: 'testimonial', label: '고객 후기' },
    { key: 'procedure', label: '시술 소개' },
    { key: 'education', label: '교육 영상' }
  ]

  useEffect(() => {
    fetchVideos()
    loadYouTubeAPI()
  }, [])

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredVideos(videos.slice(0, maxItems))
    } else {
      setFilteredVideos(videos.filter(video => video.category === activeCategory).slice(0, maxItems))
    }
  }, [videos, activeCategory, maxItems])

  const loadYouTubeAPI = () => {
    if (window.YT) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API loaded')
    }
  }

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getYouTubeVideos()
      setVideos(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('영상을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoPlay = async (videoId: string, _youtubeId: string) => {
    setPlayingVideo(videoId)

    // Increment view count
    try {
      await ContentFeaturesService.incrementYouTubeViews(parseInt(videoId))
    } catch (error) {
      console.error('Error incrementing view count:', error)
    }
  }

  const createPlayer = (containerId: string, youtubeId: string) => {
    if (!window.YT || !window.YT.Player) return

    if (playerRefs.current[containerId]) {
      playerRefs.current[containerId].destroy()
    }

    playerRefs.current[containerId] = new window.YT.Player(containerId, {
      height: '100%',
      width: '100%',
      videoId: youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            handleVideoPlay(containerId.replace('player-', ''), youtubeId)
          }
        }
      }
    })
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getYouTubeThumbnail = (youtubeId: string, quality: string = 'maxresdefault'): string => {
    return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`
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

        <div className={styles.videosGrid}>
          {filteredVideos.map((video) => (
            <div key={video.id} className={`${styles.videoCard} ${video.featured ? styles.featured : ''}`}>
              {video.featured && (
                <div className={styles.featuredBadge}>
                  <span>추천</span>
                </div>
              )}

              <div className={styles.videoWrapper}>
                <div className={styles.thumbnailContainer}>
                  <img
                    src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                    alt={video.title}
                    className={styles.thumbnail}
                  />

                  <div className={styles.playOverlay}>
                    <button
                      className={styles.playButton}
                      onClick={() => createPlayer(`player-${video.id}`, video.youtube_id)}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8 5v14l11-7z"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>

                  {video.duration_seconds && (
                    <div className={styles.duration}>
                      {formatDuration(video.duration_seconds)}
                    </div>
                  )}
                </div>

                <div
                  id={`player-${video.id}`}
                  className={`${styles.playerContainer} ${
                    playingVideo === video.id.toString() ? styles.active : ''
                  }`}
                ></div>
              </div>

              <div className={styles.videoInfo}>
                <h3 className={styles.videoTitle}>{video.title}</h3>

                {video.description && (
                  <p className={styles.videoDescription}>{video.description}</p>
                )}

                <div className={styles.videoMeta}>
                  <div className={styles.metaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>조회수 {formatViewCount(video.view_count)}</span>
                  </div>

                  <div className={styles.metaItem}>
                    <span className={styles.category}>{video.category}</span>
                  </div>
                </div>

                <div className={styles.videoActions}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeLink}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
                        fill="currentColor"
                      />
                      <path
                        d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z"
                        fill="white"
                      />
                    </svg>
                    YouTube에서 보기
                  </a>

                  <button
                    className={styles.shareButton}
                    onClick={() => navigator.share?.({
                      title: video.title,
                      url: `https://www.youtube.com/watch?v=${video.youtube_id}`
                    })}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    공유
                  </button>
                </div>
              </div>
            </div>
          ))}
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

export default YouTubeSection