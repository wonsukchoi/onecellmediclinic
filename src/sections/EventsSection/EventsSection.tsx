import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  title,
  subtitle,
  showEventTypes = true,
  maxItems = 6
}) => {
  const { t } = useTranslation()
  const [events, setEvents] = useState<EventBanner[]>([])
  const [filteredEvents, setFilteredEvents] = useState<EventBanner[]>([])
  const [activeEventType, setActiveEventType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const eventTypes = [
    { key: 'all', label: t('events.categories.all') },
    { key: 'promotion', label: t('events.categories.promotion') },
    { key: 'discount', label: t('events.categories.discount') },
    { key: 'consultation', label: t('events.categories.consultation') },
    { key: 'event', label: t('events.categories.event') },
    { key: 'seminar', label: t('events.categories.seminar') }
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
      setError(t('events.error.fetchFailed'))
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
      alert(t('events.error.registrationFailed'))
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
            <p>{t('events.loading')}</p>
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
              {t('events.error.retry')}
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
          <h2 className={styles.title}>{title || t('events.title')}</h2>
          <p className={styles.subtitle}>{subtitle || t('events.subtitle')}</p>
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
                    <span>{t('events.daysRemaining', { days: daysRemaining })}</span>
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
                        {daysRemaining > 0 ? t('events.daysRemaining', { days: daysRemaining }) : t('events.endsToday')}
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
                          {t('events.participants', { current: event.participants_count, max: event.max_participants })}
                        </span>
                      </div>
                      {availableSpots !== null && availableSpots > 0 && (
                        <span className={styles.availableSpots}>
                          {t('events.spotsRemaining', { count: availableSpots })}
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
                        {eventFull ? t('events.soldOut') : t('events.register')}
                      </a>
                    ) : (
                      <button
                        className={`${styles.actionButton} ${styles.primaryButton} ${
                          eventFull ? styles.disabled : ''
                        }`}
                        onClick={() => !eventFull && handleEventRegistration(event.id)}
                        disabled={eventFull}
                      >
                        {eventFull ? t('events.soldOut') : t('events.register')}
                      </button>
                    )}

                    <button className={`${styles.actionButton} ${styles.secondaryButton}`}>
                      {t('events.viewDetails')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className={styles.noEvents}>
            <p>{t('events.noEvents')}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventsSection