import React, { useState, useEffect } from 'react'
import { ContentFeaturesService } from '../../services/features.service'
import styles from './EventsSection.module.css'

interface EventBanner {
  id: number
  title: string
  description?: string
  image_url?: string
  event_type: string
  discount_percentage?: number
  end_date?: string
  registration_link?: string
  max_participants?: number
  participants_count: number
  event_location?: string
  registration_deadline?: string
  featured: boolean
}

interface EventsSectionProps {
  title?: string
  subtitle?: string
  showEventTypes?: boolean
  maxItems?: number
}

const EventsSection: React.FC<EventsSectionProps> = ({
  title = "원셀 이벤트",
  subtitle = "특별한 혜택과 프로모션으로 더욱 아름다운 변화를 경험하세요",
  showEventTypes = true,
  maxItems = 6
}) => {
  const [events, setEvents] = useState<EventBanner[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventBanner[]>([])
  const [activeEventType, setActiveEventType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventTypes = [
    { key: 'all', label: '전체' },
    { key: 'promotion', label: '프로모션' },
    { key: 'discount', label: '할인' },
    { key: 'consultation', label: '상담' },
    { key: 'event', label: '이벤트' },
    { key: 'seminar', label: '세미나' }
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (activeEventType === 'all') {
      setFilteredEvents(events.slice(0, maxItems))
    } else {
      setFilteredEvents(events.filter(event => event.event_type === activeEventType).slice(0, maxItems))
    }
  }, [events, activeEventType, maxItems])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await ContentFeaturesService.getEvents()
      setEvents(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('이벤트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEventRegistration = async (eventId: number) => {
    try {
      await ContentFeaturesService.registerForEvent(eventId)
      // Refresh events to get updated participant count
      fetchEvents()
    } catch (error) {
      console.error('Error registering for event:', error)
      alert('참가 신청에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const calculateDaysRemaining = (endDate: string): number => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateAvailableSpots = (maxParticipants?: number, currentParticipants?: number): number | null => {
    if (!maxParticipants) return null
    return maxParticipants - (currentParticipants || 0)
  }

  const isEventFull = (maxParticipants?: number, currentParticipants?: number): boolean => {
    if (!maxParticipants) return false
    return (currentParticipants || 0) >= maxParticipants
  }

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>이벤트를 불러오는 중...</p>
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
            <button onClick={fetchEvents} className={styles.retryButton}>
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

        {showEventTypes && (
          <div className={styles.eventTypeFilter}>
            {eventTypes.map(type => (
              <button
                key={type.key}
                className={`${styles.typeButton} ${
                  activeEventType === type.key ? styles.active : ''
                }`}
                onClick={() => setActiveEventType(type.key)}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        <div className={styles.eventsGrid}>
          {filteredEvents.map((event) => {
            const daysRemaining = event.end_date ? calculateDaysRemaining(event.end_date) : null
            const availableSpots = calculateAvailableSpots(event.max_participants, event.participants_count)
            const eventFull = isEventFull(event.max_participants, event.participants_count)

            return (
              <div key={event.id} className={`${styles.eventCard} ${event.featured ? styles.featured : ''}`}>
                {event.featured && (
                  <div className={styles.featuredBadge}>
                    <span>FEATURED</span>
                  </div>
                )}

                {daysRemaining !== null && daysRemaining <= 7 && (
                  <div className={styles.urgencyBadge}>
                    <span>{daysRemaining}일 남음</span>
                  </div>
                )}

                {event.image_url && (
                  <div className={styles.imageContainer}>
                    <img src={event.image_url} alt={event.title} className={styles.eventImage} />
                    <div className={styles.imageOverlay}>
                      {event.discount_percentage && (
                        <div className={styles.discountBadge}>
                          {event.discount_percentage}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.eventContent}>
                  <div className={styles.eventMeta}>
                    <span className={styles.eventType}>{event.event_type}</span>
                    {daysRemaining !== null && (
                      <span className={styles.timeRemaining}>
                        {daysRemaining > 0 ? `${daysRemaining}일 남음` : '오늘 마감'}
                      </span>
                    )}
                  </div>

                  <h3 className={styles.eventTitle}>{event.title}</h3>

                  {event.description && (
                    <p className={styles.eventDescription}>{event.description}</p>
                  )}

                  {event.event_location && (
                    <div className={styles.eventLocation}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      <span>{event.event_location}</span>
                    </div>
                  )}

                  {event.max_participants && (
                    <div className={styles.participantInfo}>
                      <div className={styles.participantProgress}>
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{
                              width: `${(event.participants_count / event.max_participants) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className={styles.participantText}>
                          {event.participants_count} / {event.max_participants}명
                        </span>
                      </div>
                      {availableSpots !== null && availableSpots > 0 && (
                        <span className={styles.availableSpots}>
                          {availableSpots}자리 남음
                        </span>
                      )}
                    </div>
                  )}

                  <div className={styles.eventActions}>
                    {event.registration_link ? (
                      <a
                        href={event.registration_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.actionButton} ${styles.primaryButton} ${
                          eventFull ? styles.disabled : ''
                        }`}
                        onClick={(e) => {
                          if (eventFull) {
                            e.preventDefault()
                            return
                          }
                        }}
                      >
                        {eventFull ? '마감' : '참가 신청'}
                      </a>
                    ) : (
                      <button
                        className={`${styles.actionButton} ${styles.primaryButton} ${
                          eventFull ? styles.disabled : ''
                        }`}
                        onClick={() => !eventFull && handleEventRegistration(event.id)}
                        disabled={eventFull}
                      >
                        {eventFull ? '마감' : '참가 신청'}
                      </button>
                    )}

                    <button className={`${styles.actionButton} ${styles.secondaryButton}`}>
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className={styles.noEvents}>
            <p>현재 진행 중인 이벤트가 없습니다.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventsSection