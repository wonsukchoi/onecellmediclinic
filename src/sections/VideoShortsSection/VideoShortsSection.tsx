import React, { useState, useEffect, useRef } from 'react'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './VideoShortsSection.module.css'

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
}

const VideoShortsSection: React.FC<VideoShortsProps> = ({
  title = "비디오 쇼츠",
  subtitle = "짧고 임팩트있는 영상으로 만나는 원셀 메디의원",
  showCategories = true
}) => {
  const [videos, setVideos] = useState<VideoShort[]>([])
  const [filteredVideos, setFilteredVideos] = useState<VideoShort[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      setFilteredVideos(videos.slice(0, 6))
    } else {
      setFilteredVideos(videos.filter(video => video.category === activeCategory).slice(0, 6))
    }
  }, [videos, activeCategory])

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
          {filteredVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoWrapper}>
                <img 
                  src={video.thumbnail_url || 'https://via.placeholder.com/400x500'} 
                  alt={video.title}
                  className={styles.video}
                />

                <div className={styles.brandTag}>BRAUN</div>

                <div className={styles.videoInfo}>
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                  {video.description && (
                    <p className={styles.videoDescription}>{video.description}</p>
                  )}
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

export default VideoShortsSection