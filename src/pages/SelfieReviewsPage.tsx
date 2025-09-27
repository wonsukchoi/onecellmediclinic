import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/supabase';
import type { SelfieReview } from '../types/admin';
import { Icon } from '../components/icons';
import styles from './SelfieReviewsPage.module.css';

const SelfieReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<SelfieReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<SelfieReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<SelfieReview | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const procedureTypes = [
    { value: 'all', label: '전체' },
    { value: 'plastic-surgery', label: '성형외과' },
    { value: 'dermatology', label: '피부과' },
    { value: 'aesthetic', label: '미용시술' }
  ];

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, selectedFilter]);

  const loadReviews = async (pageNum = 1, append = false) => {
    const result = await AdminService.getAll<SelfieReview>('selfie_reviews', {
      page: pageNum,
      limit: 12,
      filters: {
        moderation_status: 'approved',
        consent_given: true
      },
      sort: { field: 'display_order', direction: 'asc' }
    });

    if (result.success && result.data) {
      const newReviews = result.data.data;

      if (append) {
        setReviews(prev => [...prev, ...newReviews]);
      } else {
        setReviews(newReviews);
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
    loadReviews(nextPage, true);
  };

  const filterReviews = () => {
    if (selectedFilter === 'all') {
      setFilteredReviews(reviews);
    } else {
      const filtered = reviews.filter(review =>
        review.procedure_type === selectedFilter
      );
      setFilteredReviews(filtered);
    }
  };

  const openImageModal = (review: SelfieReview) => {
    setSelectedImage(review);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null;

    return (
      <div className={styles.stars}>
        {[...Array(5)].map((_, index) => (
          <Icon
            key={index}
            name="star"
            size={16}
            className={index < rating ? styles.starFilled : styles.starEmpty}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>셀카 후기</h1>
          <p className={styles.heroDescription}>
            실제 고객분들의 시술 후기를 확인해보세요
          </p>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={styles.filtersContent}>
          <h2 className={styles.filtersTitle}>시술 종류별 후기</h2>
          <div className={styles.filterButtons}>
            {procedureTypes.map((type) => (
              <button
                key={type.value}
                className={`${styles.filterButton} ${
                  selectedFilter === type.value ? styles.active : ''
                }`}
                onClick={() => setSelectedFilter(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.reviews}>
        <div className={styles.reviewsContent}>
          {filteredReviews.length === 0 ? (
            <div className={styles.noReviews}>
              <Icon name="image" size={48} />
              <p>해당 카테고리의 후기가 없습니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.reviewsGrid}>
                {filteredReviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div
                      className={styles.reviewImage}
                      onClick={() => openImageModal(review)}
                    >
                      <img
                        src={review.selfie_url}
                        alt={`${review.patient_name || review.patient_initial}님 후기`}
                        loading="lazy"
                      />
                      <div className={styles.imageOverlay}>
                        <Icon name="view" size={24} />
                      </div>
                    </div>

                    <div className={styles.reviewContent}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.patientInfo}>
                          <span className={styles.patientName}>
                            {review.patient_initial || review.patient_name}
                          </span>
                          {review.verified && (
                            <span className={styles.verifiedBadge}>
                              <Icon name="check" size={16} />
                              인증
                            </span>
                          )}
                        </div>
                        {review.rating && renderStars(review.rating)}
                      </div>

                      {review.procedure_type && (
                        <div className={styles.procedureType}>
                          {review.procedure_type}
                        </div>
                      )}

                      {review.review_text && (
                        <p className={styles.reviewText}>
                          {review.review_text}
                        </p>
                      )}

                      <div className={styles.reviewMeta}>
                        {review.patient_age_range && (
                          <span className={styles.ageRange}>
                            {review.patient_age_range}
                          </span>
                        )}
                        {review.treatment_date && (
                          <span className={styles.treatmentDate}>
                            시술일: {new Date(review.treatment_date).toLocaleDateString('ko-KR')}
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

      {selectedImage && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeImageModal}>
              <Icon name="close" size={24} />
            </button>

            <div className={styles.modalImage}>
              <img
                src={selectedImage.selfie_url}
                alt={`${selectedImage.patient_name || selectedImage.patient_initial}님 후기`}
              />
            </div>

            <div className={styles.modalDetails}>
              <div className={styles.modalHeader}>
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>
                    {selectedImage.patient_initial || selectedImage.patient_name}
                  </span>
                  {selectedImage.verified && (
                    <span className={styles.verifiedBadge}>
                      <Icon name="check" size={16} />
                      인증
                    </span>
                  )}
                </div>
                {selectedImage.rating && renderStars(selectedImage.rating)}
              </div>

              {selectedImage.procedure_type && (
                <div className={styles.procedureType}>
                  {selectedImage.procedure_type}
                </div>
              )}

              {selectedImage.review_text && (
                <p className={styles.reviewText}>
                  {selectedImage.review_text}
                </p>
              )}

              <div className={styles.reviewMeta}>
                {selectedImage.patient_age_range && (
                  <span className={styles.ageRange}>
                    연령대: {selectedImage.patient_age_range}
                  </span>
                )}
                {selectedImage.treatment_date && (
                  <span className={styles.treatmentDate}>
                    시술일: {new Date(selectedImage.treatment_date).toLocaleDateString('ko-KR')}
                  </span>
                )}
                {selectedImage.recovery_weeks && (
                  <span className={styles.recoveryTime}>
                    회복기간: {selectedImage.recovery_weeks}주
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfieReviewsPage;