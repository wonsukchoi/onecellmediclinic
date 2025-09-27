import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '../services/supabase';
import type { Procedure, ProcedureCategory } from '../types';
import { Icon } from '../components/icons';
import styles from './PriceGuidePage.module.css';

interface PriceCategory {
  id: number;
  name: string;
  procedures: Procedure[];
}

const PriceGuidePage: React.FC = () => {
  const [priceCategories, setPriceCategories] = useState<PriceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadPriceData();
  }, []);

  const loadPriceData = async () => {
    try {
      const [categoriesResult, proceduresResult] = await Promise.all([
        AdminService.getAll<ProcedureCategory>('procedure_categories', {
          filters: { active: true },
          sort: { field: 'display_order', direction: 'asc' }
        }),
        AdminService.getAll<Procedure>('procedures', {
          filters: { active: true },
          sort: { field: 'display_order', direction: 'asc' }
        })
      ]);

      if (categoriesResult.success && proceduresResult.success &&
          categoriesResult.data && proceduresResult.data) {

        const categories = categoriesResult.data.data;
        const procedures = proceduresResult.data.data;

        const priceData = categories.map(category => ({
          id: category.id,
          name: category.name,
          procedures: procedures.filter(proc => proc.category_id === category.id)
        }));

        setPriceCategories(priceData);
        if (priceData.length > 0) {
          setSelectedCategory(priceData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading price data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceRange: string | undefined) => {
    if (!priceRange) return '상담 후 결정';
    return priceRange;
  };

  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  };

  const selectedCategoryData = priceCategories.find(cat => cat.id === selectedCategory);

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>시술 가격 안내</h1>
          <p className={styles.heroDescription}>
            투명하고 합리적인 가격으로 최고의 서비스를 제공합니다
          </p>
        </div>
      </section>

      <section className={styles.notice}>
        <div className={styles.noticeContent}>
          <div className={styles.noticeCard}>
            <Icon name="alertTriangle" size={24} />
            <div className={styles.noticeText}>
              <h3>가격 안내 유의사항</h3>
              <ul>
                <li>표시된 가격은 기본 시술 기준이며, 개인의 상태에 따라 달라질 수 있습니다.</li>
                <li>정확한 비용은 전문의 상담 후 확정됩니다.</li>
                <li>패키지 할인 및 이벤트 가격은 별도 문의해주세요.</li>
                <li>모든 시술은 사전 상담이 필요합니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.prices}>
        <div className={styles.pricesContent}>
          <div className={styles.categoryTabs}>
            {priceCategories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryTab} ${
                  selectedCategory === category.id ? styles.active : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {selectedCategoryData && (
            <div className={styles.priceTable}>
              <div className={styles.tableHeader}>
                <div className={styles.headerCell}>시술명</div>
                <div className={styles.headerCell}>가격</div>
                <div className={styles.headerCell}>소요시간</div>
                <div className={styles.headerCell}>상세정보</div>
              </div>

              <div className={styles.tableBody}>
                {selectedCategoryData.procedures.length === 0 ? (
                  <div className={styles.noProcedures}>
                    <Icon name="alertTriangle" size={32} />
                    <p>등록된 시술이 없습니다.</p>
                  </div>
                ) : (
                  selectedCategoryData.procedures.map((procedure) => (
                    <div key={procedure.id} className={styles.tableRow}>
                      <div className={styles.tableCell}>
                        <div className={styles.procedureInfo}>
                          <h4 className={styles.procedureName}>{procedure.name}</h4>
                          {procedure.description && (
                            <p className={styles.procedureDescription}>
                              {procedure.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={styles.tableCell}>
                        <div className={styles.priceValue}>
                          {formatPrice(procedure.price_range)}
                        </div>
                      </div>

                      <div className={styles.tableCell}>
                        <div className={styles.durationValue}>
                          {formatDuration(procedure.duration_minutes)}
                        </div>
                      </div>

                      <div className={styles.tableCell}>
                        <Link
                          to={`/procedures/${procedure.category_id}/${procedure.slug}`}
                          className={styles.detailButton}
                        >
                          자세히 보기
                          <Icon name="arrowLeft" size={14} />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.paymentInfo}>
        <div className={styles.paymentInfoContent}>
          <h2 className={styles.sectionTitle}>결제 안내</h2>
          <div className={styles.paymentGrid}>
            <div className={styles.paymentCard}>
              <div className={styles.paymentIcon}>
                <Icon name="star" size={32} />
              </div>
              <h3 className={styles.paymentTitle}>카드 결제</h3>
              <ul className={styles.paymentList}>
                <li>모든 카드사 결제 가능</li>
                <li>일시불, 할부 결제 지원</li>
                <li>무이자 할부 이벤트 진행</li>
              </ul>
            </div>

            <div className={styles.paymentCard}>
              <div className={styles.paymentIcon}>
                <Icon name="star" size={32} />
              </div>
              <h3 className={styles.paymentTitle}>현금 결제</h3>
              <ul className={styles.paymentList}>
                <li>현금 결제시 할인 혜택</li>
                <li>계좌이체 가능</li>
                <li>현금영수증 발급</li>
              </ul>
            </div>

            <div className={styles.paymentCard}>
              <div className={styles.paymentIcon}>
                <Icon name="star" size={32} />
              </div>
              <h3 className={styles.paymentTitle}>패키지 할인</h3>
              <ul className={styles.paymentList}>
                <li>복합 시술시 할인 적용</li>
                <li>멤버십 혜택 제공</li>
                <li>재시술 할인 혜택</li>
              </ul>
            </div>

            <div className={styles.paymentCard}>
              <div className={styles.paymentIcon}>
                <Icon name="star" size={32} />
              </div>
              <h3 className={styles.paymentTitle}>보험 안내</h3>
              <ul className={styles.paymentList}>
                <li>일부 치료 시술 보험 적용</li>
                <li>실손보험 청구 가능</li>
                <li>영수증 발급 서비스</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.consultation}>
        <div className={styles.consultationContent}>
          <h2 className={styles.consultationTitle}>정확한 견적이 필요하신가요?</h2>
          <p className={styles.consultationDescription}>
            개인별 맞춤 상담을 통해 정확한 비용을 안내해드립니다
          </p>
          <div className={styles.consultationActions}>
            <Link to="/consultation" className={styles.consultButton}>
              <Icon name="chat" size={16} />
              온라인 상담
            </Link>
            <a href="tel:02-1234-5678" className={styles.phoneButton}>
              <Icon name="chat" size={16} />
              전화 상담
            </a>
            <Link to="/reservation" className={styles.reserveButton}>
              <Icon name="calendar" size={16} />
              상담 예약
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.faqContent}>
          <h2 className={styles.sectionTitle}>가격 관련 FAQ</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>Q. 분할 결제가 가능한가요?</h3>
              <p className={styles.faqAnswer}>
                네, 카드 할부 결제가 가능하며 무이자 할부 이벤트도 진행하고 있습니다.
                자세한 사항은 상담 시 안내해드립니다.
              </p>
            </div>

            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>Q. 패키지 할인이 있나요?</h3>
              <p className={styles.faqAnswer}>
                복합 시술이나 여러 부위 동시 시술시 할인 혜택을 제공합니다.
                개인 상담을 통해 최적의 패키지를 제안해드립니다.
              </p>
            </div>

            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>Q. 추가 비용이 발생할 수 있나요?</h3>
              <p className={styles.faqAnswer}>
                기본 시술 외 추가 케어나 약물이 필요한 경우에만 발생하며,
                사전에 충분히 설명하고 동의를 구한 후 진행합니다.
              </p>
            </div>

            <div className={styles.faqCard}>
              <h3 className={styles.faqQuestion}>Q. 환불이 가능한가요?</h3>
              <p className={styles.faqAnswer}>
                시술 전 취소시 환불 가능하며, 시술 후에는 의료법에 따라
                제한이 있을 수 있습니다. 자세한 환불 정책은 상담시 안내해드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PriceGuidePage;