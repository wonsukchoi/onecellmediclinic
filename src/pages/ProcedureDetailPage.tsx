import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminService } from '../services/supabase';
import type { Procedure, GalleryItem } from '../types';
import { Icon } from '../components/icons';
import styles from './ProcedureDetailPage.module.css';

const ProcedureDetailPage: React.FC = () => {
  const { category, procedure: procedureSlug } = useParams<{ category: string; procedure: string }>();
  const [procedure, setProcedure] = useState<Procedure | null>(null);
  const [relatedProcedures, setRelatedProcedures] = useState<Procedure[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (procedureSlug) {
      loadProcedureData();
    }
  }, [procedureSlug, category]);

  const loadProcedureData = async () => {
    if (!procedureSlug) return;

    const procedureResult = await AdminService.getAll<Procedure>('procedures', {
      filters: { slug: procedureSlug, active: true },
      limit: 1
    });

    if (procedureResult.success && procedureResult.data?.data && procedureResult.data.data.length > 0) {
      const currentProcedure = procedureResult.data!.data[0];
      setProcedure(currentProcedure);

      const [relatedResult, galleryResult] = await Promise.all([
        AdminService.getAll<Procedure>('procedures', {
          filters: {
            category_id: currentProcedure.category_id,
            active: true
          },
          limit: 4
        }),
        AdminService.getAll<GalleryItem>('gallery_items', {
          filters: {
            procedure_id: currentProcedure.id,
            consent_given: true
          },
          limit: 6
        })
      ]);

      if (relatedResult.success && relatedResult.data) {
        const filtered = relatedResult.data.data.filter(p => p.id !== currentProcedure.id);
        setRelatedProcedures(filtered);
      }

      if (galleryResult.success && galleryResult.data) {
        setGalleryItems(galleryResult.data.data);
      }
    }

    setLoading(false);
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;
  if (!procedure) return <div className={styles.notFound}>시술을 찾을 수 없습니다.</div>;

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link to="/procedures">시술 안내</Link>
        <Icon name="chevronRight" size={16} />
        <Link to={`/procedures/${procedure.category_id}`}>
          {procedure.category?.name || '카테고리'}
        </Link>
        <Icon name="chevronRight" size={16} />
        <span>{procedure.name}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.procedureInfo}>
            <h1 className={styles.procedureTitle}>{procedure.name}</h1>
            <p className={styles.procedureDescription}>
              {procedure.description || '전문적인 시술 서비스'}
            </p>

            <div className={styles.procedureDetails}>
              {procedure.duration_minutes && (
                <div className={styles.detailItem}>
                  <Icon name="clock" size={20} />
                  <span>소요시간: {procedure.duration_minutes}분</span>
                </div>
              )}
              {procedure.price_range && (
                <div className={styles.detailItem}>
                  <Icon name="star" size={20} />
                  <span>비용: {procedure.price_range}</span>
                </div>
              )}
              {procedure.recovery_time && (
                <div className={styles.detailItem}>
                  <Icon name="medical" size={20} />
                  <span>회복기간: {procedure.recovery_time}</span>
                </div>
              )}
            </div>

            <div className={styles.actionButtons}>
              <Link to="/consultation" className={styles.consultButton}>
                상담 문의
              </Link>
              <Link to="/reservation" className={styles.reserveButton}>
                예약하기
              </Link>
            </div>
          </div>

          <div className={styles.procedureImage}>
            {procedure.featured_image_url ? (
              <img
                src={procedure.featured_image_url}
                alt={procedure.name}
                onClick={() => openImageModal(procedure.featured_image_url!)}
              />
            ) : (
              <div className={styles.placeholderImage}>
                <Icon name="medical" size={80} />
              </div>
            )}
          </div>
        </div>
      </section>

      {procedure.detailed_description && (
        <section className={styles.details}>
          <div className={styles.sectionContent}>
            <h2>시술 상세 정보</h2>
            <div className={styles.detailedDescription}>
              {procedure.detailed_description}
            </div>
          </div>
        </section>
      )}

      {procedure.preparation_instructions && (
        <section className={styles.preparation}>
          <div className={styles.sectionContent}>
            <h2>시술 전 준비사항</h2>
            <div className={styles.preparationContent}>
              {procedure.preparation_instructions}
            </div>
          </div>
        </section>
      )}

      {galleryItems.length > 0 && (
        <section className={styles.gallery}>
          <div className={styles.sectionContent}>
            <h2>시술 전후 사진</h2>
            <div className={styles.galleryGrid}>
              {galleryItems.map((item) => (
                <div key={item.id} className={styles.galleryItem}>
                  <div className={styles.beforeAfter}>
                    <div className={styles.imageContainer}>
                      <img
                        src={item.before_image_url}
                        alt="Before"
                        onClick={() => openImageModal(item.before_image_url)}
                      />
                      <span className={styles.imageLabel}>Before</span>
                    </div>
                    <div className={styles.imageContainer}>
                      <img
                        src={item.after_image_url}
                        alt="After"
                        onClick={() => openImageModal(item.after_image_url)}
                      />
                      <span className={styles.imageLabel}>After</span>
                    </div>
                  </div>
                  {item.patient_testimonial && (
                    <p className={styles.testimonial}>{item.patient_testimonial}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {relatedProcedures.length > 0 && (
        <section className={styles.related}>
          <div className={styles.sectionContent}>
            <h2>관련 시술</h2>
            <div className={styles.relatedGrid}>
              {relatedProcedures.map((related) => (
                <Link
                  key={related.id}
                  to={`/procedures/${related.category_id}/${related.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    {related.featured_image_url ? (
                      <img src={related.featured_image_url} alt={related.name} />
                    ) : (
                      <div className={styles.placeholderImage}>
                        <Icon name="medical" size={32} />
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedContent}>
                    <h3>{related.name}</h3>
                    <p>{related.description}</p>
                    {related.price_range && (
                      <span className={styles.price}>{related.price_range}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {selectedImage && (
        <div className={styles.imageModal} onClick={closeImageModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeImageModal}>
              <Icon name="close" size={24} />
            </button>
            <img src={selectedImage} alt="확대 이미지" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcedureDetailPage;