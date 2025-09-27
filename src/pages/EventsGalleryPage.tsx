import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminService } from '../services/supabase';
import type { EventBanner } from '../types';
import type { ListParams } from '../types/admin';
import { Icon } from '../components/icons';
import styles from './EventsGalleryPage.module.css';

// Sort options for events
const SORT_OPTIONS = [
  { value: 'start_date', label: '이벤트 날짜순', direction: 'desc' as const },
  { value: 'priority', label: '우선순위순', direction: 'desc' as const },
  { value: 'view_count', label: '인기순', direction: 'desc' as const },
  { value: 'created_at', label: '최신순', direction: 'desc' as const },
];

// Filter options for event types
const EVENT_TYPE_OPTIONS = [
  { value: '', label: '전체 이벤트' },
  { value: 'promotion', label: '할인 프로모션' },
  { value: 'event', label: '특별 이벤트' },
  { value: 'consultation', label: '상담 이벤트' },
  { value: 'procedure', label: '시술 이벤트' },
  { value: 'announcement', label: '공지사항' },
];

// Status filter options
const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'active', label: '진행중' },
  { value: 'featured', label: '추천 이벤트' },
  { value: 'ending-soon', label: '마감 임박' },
];

interface Filters {
  eventType: string;
  status: string;
  search: string;
}

interface Sorting {
  field: string;
  direction: 'asc' | 'desc';
}

const EventsGalleryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState<EventBanner[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  // Filtering and sorting state
  const [filters, setFilters] = useState<Filters>({
    eventType: searchParams.get('type') || '',
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  });

  const [sorting, setSorting] = useState<Sorting>({
    field: searchParams.get('sort') || 'start_date',
    direction: (searchParams.get('dir') as 'asc' | 'desc') || 'desc',
  });

  // Load events data
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters for the API call
      const apiFilters: Record<string, any> = {};

      // Event type filter
      if (filters.eventType) {
        apiFilters.event_type = filters.eventType;
      }

      // Status filters
      if (filters.status === 'active') {
        apiFilters.active = true;
      } else if (filters.status === 'featured') {
        apiFilters.featured = true;
      } else if (filters.status === 'ending-soon') {
        // Events ending within 7 days
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        apiFilters.end_date = weekFromNow.toISOString().split('T')[0];
      }

      const params: ListParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: filters.search,
        filters: apiFilters,
        sort: { field: sorting.field, direction: sorting.direction },
      };

      const result = await AdminService.getAll<EventBanner>('event_banners', params);

      if (result.success && result.data) {
        setEvents(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalItems(result.data.total);
      } else {
        setError(result.error || '이벤트 데이터를 불러오는데 실패했습니다');
        setEvents([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, sorting]);

  // Load featured events for carousel
  const loadFeaturedEvents = useCallback(async () => {
    try {
      const params: ListParams = {
        page: 1,
        limit: 5,
        filters: { featured: true, active: true },
        sort: { field: 'priority', direction: 'desc' },
      };

      const result = await AdminService.getAll<EventBanner>('event_banners', params);

      if (result.success && result.data) {
        setFeaturedEvents(result.data.data);
      }
    } catch (err) {
      console.error('Featured events load error:', err);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    loadEvents();
    loadFeaturedEvents();
  }, [loadEvents, loadFeaturedEvents]);

  // Update URL params when filters/sorting change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.eventType) params.set('type', filters.eventType);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (sorting.field !== 'start_date') params.set('sort', sorting.field);
    if (sorting.direction !== 'desc') params.set('dir', sorting.direction);
    if (currentPage > 1) params.set('page', currentPage.toString());

    setSearchParams(params);
  }, [filters, sorting, currentPage, setSearchParams]);

  // Carousel auto-rotate
  useEffect(() => {
    if (featuredEvents.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex(prev => (prev + 1) % featuredEvents.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredEvents.length]);

  // Event handlers
  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSorting({ field, direction });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEventClick = (event: EventBanner) => {
    // Increment view count (in real app, this would be an API call)
    // For now, just navigate to event details or registration
    if (event.registration_link) {
      window.open(event.registration_link, '_blank');
    } else if (event.link_url) {
      window.open(event.link_url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isEventActive = (event: EventBanner) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return now >= startDate && now <= endDate && event.active;
  };

  const isEventEndingSoon = (event: EventBanner) => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilEnd <= 7 && daysUntilEnd > 0;
  };

  return (
    <div className={styles.eventsGallery}>
      {/* Hero Section with Featured Events Carousel */}
      {featuredEvents.length > 0 && (
        <section className={styles.heroSection}>
          <div className={styles.carousel}>
            <div className={styles.carouselContainer}>
              {featuredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`${styles.carouselSlide} ${
                    index === currentCarouselIndex ? styles.active : ''
                  }`}
                  onClick={() => handleEventClick(event)}
                >
                  {event.image_url && (
                    <div className={styles.carouselImage}>
                      <img src={event.image_url} alt={event.title} />
                    </div>
                  )}
                  <div className={styles.carouselContent}>
                    <div className={styles.carouselBadges}>
                      {event.featured && (
                        <span className={styles.featuredBadge}>추천</span>
                      )}
                      {event.discount_percentage && (
                        <span className={styles.discountBadge}>
                          {event.discount_percentage}% 할인
                        </span>
                      )}
                    </div>
                    <h2 className={styles.carouselTitle}>{event.title}</h2>
                    <p className={styles.carouselDescription}>{event.description}</p>
                    <div className={styles.carouselMeta}>
                      <span className={styles.eventDates}>
                        {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </span>
                      {event.max_participants && (
                        <span className={styles.participants}>
                          참여: {event.participants_count || 0}/{event.max_participants}명
                        </span>
                      )}
                    </div>
                    {(event.registration_link || event.link_url) && (
                      <button className={styles.carouselButton}>
                        {event.button_text || '자세히 보기'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Navigation */}
            {featuredEvents.length > 1 && (
              <>
                <button
                  className={`${styles.carouselNav} ${styles.prev}`}
                  onClick={() => setCurrentCarouselIndex(prev =>
                    prev === 0 ? featuredEvents.length - 1 : prev - 1
                  )}
                >
                  <Icon name="chevronLeft" size="md" />
                </button>
                <button
                  className={`${styles.carouselNav} ${styles.next}`}
                  onClick={() => setCurrentCarouselIndex(prev =>
                    (prev + 1) % featuredEvents.length
                  )}
                >
                  <Icon name="chevronRight" size="md" />
                </button>

                <div className={styles.carouselDots}>
                  {featuredEvents.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.dot} ${
                        index === currentCarouselIndex ? styles.active : ''
                      }`}
                      onClick={() => setCurrentCarouselIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className={styles.container}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>이벤트 & 프로모션</h1>
          <p className={styles.pageSubtitle}>
            원셀의 다양한 이벤트와 특별 혜택을 확인해보세요
          </p>
        </header>

        {/* Filters and Search */}
        <div className={styles.controlsSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="이벤트 검색..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className={styles.searchInput}
            />
            <Icon name="search" size="sm" className={styles.searchIcon} />
          </div>

          <div className={styles.filtersContainer}>
            <select
              value={filters.eventType}
              onChange={(e) => handleFilterChange('eventType', e.target.value)}
              className={styles.filterSelect}
            >
              {EVENT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterSelect}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={`${sorting.field}-${sorting.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                handleSortChange(field, direction as 'asc' | 'desc');
              }}
              className={styles.sortSelect}
            >
              {SORT_OPTIONS.map(option => (
                <option
                  key={`${option.value}-${option.direction}`}
                  value={`${option.value}-${option.direction}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            총 {totalItems}개의 이벤트
          </span>
          <button
            onClick={() => {
              setFilters({ eventType: '', status: '', search: '' });
              setSorting({ field: 'start_date', direction: 'desc' });
              setCurrentPage(1);
            }}
            className={styles.clearFilters}
          >
            <Icon name="refresh" size="sm" />
            필터 초기화
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <span>이벤트를 불러오는 중...</span>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <Icon name="warning" size="lg" />
            <p>{error}</p>
            <button onClick={loadEvents} className={styles.retryButton}>
              다시 시도
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="calendar" size="xl" />
            <h3>검색 결과가 없습니다</h3>
            <p>다른 검색 조건을 시도해보세요</p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => {
              const isActive = isEventActive(event);
              const isEndingSoon = isEventEndingSoon(event);

              return (
                <div
                  key={event.id}
                  className={`${styles.eventCard} ${!isActive ? styles.inactive : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  {/* Event Image */}
                  {event.image_url && (
                    <div className={styles.eventImage}>
                      <img src={event.image_url} alt={event.title} />
                      <div className={styles.eventBadges}>
                        {event.featured && (
                          <span className={styles.featuredBadge}>추천</span>
                        )}
                        {event.discount_percentage && (
                          <span className={styles.discountBadge}>
                            {event.discount_percentage}% 할인
                          </span>
                        )}
                        {isEndingSoon && (
                          <span className={styles.endingSoonBadge}>마감 임박</span>
                        )}
                        {!isActive && (
                          <span className={styles.inactiveBadge}>종료</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Event Content */}
                  <div className={styles.eventContent}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDescription}>{event.description}</p>

                    <div className={styles.eventMeta}>
                      <div className={styles.eventDates}>
                        <Icon name="calendar" size="sm" />
                        <span>
                          {formatDate(event.start_date)} - {formatDate(event.end_date)}
                        </span>
                      </div>

                      {event.event_location && (
                        <div className={styles.eventLocation}>
                          <Icon name="user" size="sm" />
                          <span>{event.event_location}</span>
                        </div>
                      )}

                      {event.max_participants && (
                        <div className={styles.eventParticipants}>
                          <Icon name="user" size="sm" />
                          <span>
                            {event.participants_count || 0}/{event.max_participants}명 참여
                          </span>
                        </div>
                      )}

                      {event.view_count && (
                        <div className={styles.eventViews}>
                          <Icon name="view" size="sm" />
                          <span>{event.view_count}회 조회</span>
                        </div>
                      )}
                    </div>

                    {/* Registration Button */}
                    {(event.registration_link || event.link_url) && isActive && (
                      <button
                        className={styles.registerButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {event.button_text || '신청하기'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={styles.pageButton}
            >
              <Icon name="chevronLeft" size="sm" />
              이전
            </button>

            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`${styles.pageNumber} ${
                      pageNum === currentPage ? styles.active : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={styles.pageButton}
            >
              다음
              <Icon name="chevronRight" size="sm" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsGalleryPage;