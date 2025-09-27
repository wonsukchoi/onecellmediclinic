import React, { useState, useEffect } from 'react';
import { Icon } from '../components/icons';
import styles from './FAQPage.module.css';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'procedure', label: '시술 관련' },
    { value: 'reservation', label: '예약 관련' },
    { value: 'cost', label: '비용 관련' },
    { value: 'aftercare', label: '사후관리' },
    { value: 'general', label: '일반 문의' }
  ];

  // Mock FAQ data - in a real app, this would come from the database
  const mockFaqs: FAQItem[] = [
    {
      id: 1,
      question: '첫 방문 시 준비해야 할 것이 있나요?',
      answer: '첫 방문 시에는 신분증과 함께 현재 복용 중인 약물이나 알레르기가 있는 경우 관련 정보를 가져오시면 됩니다. 상담을 위해 관심 있는 시술 부위의 사진을 미리 준비해주시면 더욱 정확한 상담이 가능합니다.',
      category: 'general'
    },
    {
      id: 2,
      question: '예약은 어떻게 하나요?',
      answer: '온라인 예약은 홈페이지의 예약 페이지에서 24시간 가능하며, 전화 예약은 진료시간 내에 02-1234-5678로 연락해주시면 됩니다. 카카오톡 상담도 가능합니다.',
      category: 'reservation'
    },
    {
      id: 3,
      question: '시술 후 주의사항이 있나요?',
      answer: '시술 종류에 따라 주의사항이 다릅니다. 일반적으로 시술 후 24-48시간은 과도한 운동이나 사우나, 음주는 피해주시고, 처방받은 연고나 약물을 규칙적으로 사용해주세요. 시술별 상세한 주의사항은 시술 후 안내해드립니다.',
      category: 'aftercare'
    },
    {
      id: 4,
      question: '비용은 어떻게 되나요?',
      answer: '시술 비용은 개인의 상태와 시술 범위에 따라 달라집니다. 정확한 비용은 상담 후 안내해드리며, 카드 결제와 현금 결제 모두 가능합니다. 할부 결제도 상담 후 안내해드립니다.',
      category: 'cost'
    },
    {
      id: 5,
      question: '보톡스 시술은 얼마나 걸리나요?',
      answer: '보톡스 시술은 보통 10-15분 정도 소요됩니다. 시술 전 상담 시간을 포함하면 약 30분 정도 예상하시면 됩니다. 시술 후 바로 일상생활이 가능합니다.',
      category: 'procedure'
    },
    {
      id: 6,
      question: '필러 시술의 지속 기간은 어떻게 되나요?',
      answer: '필러의 종류와 개인차에 따라 다르지만, 일반적으로 6개월에서 1년 정도 지속됩니다. 히알루론산 필러의 경우 서서히 흡수되어 자연스럽게 줄어듭니다.',
      category: 'procedure'
    },
    {
      id: 7,
      question: '예약 취소나 변경은 언제까지 가능한가요?',
      answer: '예약 취소나 변경은 예약일 1일 전까지 가능합니다. 당일 취소의 경우 취소 수수료가 발생할 수 있으니 미리 연락해주시기 바랍니다.',
      category: 'reservation'
    },
    {
      id: 8,
      question: '부작용이 있을 수 있나요?',
      answer: '모든 의료시술에는 부작용의 가능성이 있습니다. 하지만 숙련된 의료진과 안전한 시술로 부작용을 최소화하고 있습니다. 시술 전 충분한 상담을 통해 개인의 상태를 확인하고 적합한 시술을 진행합니다.',
      category: 'procedure'
    },
    {
      id: 9,
      question: '시술 후 언제부터 화장이 가능한가요?',
      answer: '시술 종류에 따라 다르지만, 일반적으로 보톡스는 당일, 필러는 다음날부터 화장이 가능합니다. 레이저 시술의 경우 2-3일 후부터 가능하며, 상세한 안내는 시술 후 제공해드립니다.',
      category: 'aftercare'
    },
    {
      id: 10,
      question: '주차는 가능한가요?',
      answer: '네, 건물 지하 1-3층에 주차장이 있으며, 진료 환자는 2시간 무료 주차가 가능합니다. 주차권은 접수데스크에서 인증받으시면 됩니다.',
      category: 'general'
    }
  ];

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [faqs, selectedCategory, searchTerm]);

  const loadFaqs = async () => {
    try {
      // In a real implementation, you might load FAQ data from the database
      // For now, we'll use mock data
      setFaqs(mockFaqs);
      setLoading(false);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      setFaqs(mockFaqs);
      setLoading(false);
    }
  };

  const filterFaqs = () => {
    let filtered = faqs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFaqs(filtered);
  };

  const toggleAccordion = (id: number) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setOpenAccordion(null);
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>자주 묻는 질문</h1>
          <p className={styles.heroDescription}>
            고객님들이 자주 궁금해하시는 질문들을 모았습니다
          </p>
        </div>
      </section>

      <section className={styles.search}>
        <div className={styles.searchContent}>
          <div className={styles.searchBox}>
            <Icon name="search" size={20} />
            <input
              type="text"
              placeholder="궁금한 내용을 검색해보세요"
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
        </div>
      </section>

      <section className={styles.filters}>
        <div className={styles.filtersContent}>
          <div className={styles.filterButtons}>
            {categories.map((category) => (
              <button
                key={category.value}
                className={`${styles.filterButton} ${
                  selectedCategory === category.value ? styles.active : ''
                }`}
                onClick={() => {
                  setSelectedCategory(category.value);
                  setOpenAccordion(null);
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.faqContent}>
          {filteredFaqs.length === 0 ? (
            <div className={styles.noResults}>
              <Icon name="alertTriangle" size={48} />
              <p>
                {searchTerm
                  ? '검색 결과가 없습니다. 다른 키워드로 검색해보세요.'
                  : '해당 카테고리의 FAQ가 없습니다.'
                }
              </p>
            </div>
          ) : (
            <div className={styles.faqList}>
              {filteredFaqs.map((faq, index) => (
                <div key={faq.id} className={styles.faqItem}>
                  <button
                    className={`${styles.faqQuestion} ${
                      openAccordion === faq.id ? styles.active : ''
                    }`}
                    onClick={() => toggleAccordion(faq.id)}
                  >
                    <span className={styles.questionNumber}>Q{index + 1}</span>
                    <span className={styles.questionText}>{faq.question}</span>
                    <Icon
                      name="chevronDown"
                      size={20}
                      className={styles.chevron}
                    />
                  </button>

                  <div
                    className={`${styles.faqAnswer} ${
                      openAccordion === faq.id ? styles.open : ''
                    }`}
                  >
                    <div className={styles.answerContent}>
                      <span className={styles.answerLabel}>A</span>
                      <p className={styles.answerText}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.contact}>
        <div className={styles.contactContent}>
          <h2 className={styles.contactTitle}>원하는 답변을 찾지 못하셨나요?</h2>
          <p className={styles.contactDescription}>
            더 자세한 문의사항이 있으시면 언제든 연락해주세요
          </p>
          <div className={styles.contactActions}>
            <a href="tel:02-1234-5678" className={styles.phoneButton}>
              <Icon name="chat" size={16} />
              전화 문의
            </a>
            <a href="/consultation" className={styles.consultButton}>
              <Icon name="chat" size={16} />
              온라인 상담
            </a>
            <a href="/contact" className={styles.contactButton}>
              <Icon name="mail" size={16} />
              문의하기
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;