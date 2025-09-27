import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '../services/supabase';
import type { ProcedureCategory, Procedure } from '../types';
import { Icon } from '../components/icons';
import styles from './ProceduresOverviewPage.module.css';

const ProceduresOverviewPage: React.FC = () => {
  const [categories, setCategories] = useState<ProcedureCategory[]>([]);
  const [featuredProcedures, setFeaturedProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [categoriesResult, proceduresResult] = await Promise.all([
      AdminService.getAll<ProcedureCategory>('procedure_categories', {
        filters: { active: true },
        sort: { field: 'display_order', direction: 'asc' }
      }),
      AdminService.getAll<Procedure>('procedures', {
        limit: 6,
        filters: { active: true },
        sort: { field: 'display_order', direction: 'asc' }
      })
    ]);

    if (categoriesResult.success && categoriesResult.data) {
      setCategories(categoriesResult.data.data);
    }

    if (proceduresResult.success && proceduresResult.data) {
      setFeaturedProcedures(proceduresResult.data.data);
    }

    setLoading(false);
  };


  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>시술 안내</h1>
          <p className={styles.heroDescription}>
            원셀의료의원의 전문적인 시술 서비스를 확인해보세요
          </p>
        </div>
      </section>

      <section className={styles.categories}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>시술 카테고리</h2>
          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/procedures/${category.id}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryIcon}>
                  <Icon name="medical" size={48} />
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
                <p className={styles.categoryDescription}>{category.description}</p>
                <div className={styles.categoryArrow}>
                  <Icon name="arrowLeft" size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>인기 시술</h2>
          <div className={styles.proceduresGrid}>
            {featuredProcedures.map((procedure) => (
              <div key={procedure.id} className={styles.procedureCard}>
                <div className={styles.procedureImage}>
                  {procedure.featured_image_url ? (
                    <img
                      src={procedure.featured_image_url}
                      alt={procedure.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <Icon name="medical" size={48} />
                    </div>
                  )}
                </div>
                <div className={styles.procedureContent}>
                  <h3 className={styles.procedureName}>{procedure.name}</h3>
                  <p className={styles.procedureDescription}>
                    {procedure.description || '전문적인 시술 서비스'}
                  </p>
                  {procedure.price_range && (
                    <div className={styles.procedurePrice}>
                      {procedure.price_range}
                    </div>
                  )}
                  {procedure.duration_minutes && (
                    <div className={styles.procedureDuration}>
                      소요시간: {procedure.duration_minutes}분
                    </div>
                  )}
                  <Link
                    to={`/procedures/${procedure.category_id}/${procedure.slug}`}
                    className={styles.procedureLink}
                  >
                    자세히 보기
                    <Icon name="arrowLeft" size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.consultation}>
        <div className={styles.consultationContent}>
          <h2 className={styles.consultationTitle}>무료 상담 받기</h2>
          <p className={styles.consultationDescription}>
            시술에 대한 궁금한 점이 있으시면 언제든 상담받으세요
          </p>
          <div className={styles.consultationActions}>
            <Link to="/consultation" className={styles.consultationButton}>
              온라인 상담
            </Link>
            <Link to="/reservation" className={styles.reservationButton}>
              예약하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProceduresOverviewPage;