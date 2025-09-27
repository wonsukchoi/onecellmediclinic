import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminService } from '../services/supabase';
import type { BlogPost } from '../types';
import { Icon } from '../components/icons';
import styles from './NoticesPage.module.css';

const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async (pageNum = 1, append = false) => {
    const result = await AdminService.getAll<BlogPost>('blog_posts', {
      page: pageNum,
      limit: 10,
      filters: {
        published: true
      },
      sort: { field: 'created_at', direction: 'desc' }
    });

    if (result.success && result.data) {
      const newNotices = result.data.data;

      if (append) {
        setNotices(prev => [...prev, ...newNotices]);
      } else {
        setNotices(newNotices);
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
    loadNotices(nextPage, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const getNoticeType = (title: string) => {
    if (title.includes('[중요]')) return { type: 'important', label: '중요' };
    if (title.includes('[공지]')) return { type: 'notice', label: '공지' };
    if (title.includes('[이벤트]')) return { type: 'event', label: '이벤트' };
    if (title.includes('[휴진]')) return { type: 'closure', label: '휴진' };
    return { type: 'general', label: '일반' };
  };

  if (loading) return <div className={styles.loading}>로딩중...</div>;

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>공지사항</h1>
          <p className={styles.heroDescription}>
            원셀의료의원의 최신 소식과 공지사항을 확인하세요
          </p>
        </div>
      </section>

      <section className={styles.notices}>
        <div className={styles.noticesContent}>
          {notices.length === 0 ? (
            <div className={styles.noNotices}>
              <Icon name="settings" size={48} />
              <p>등록된 공지사항이 없습니다.</p>
            </div>
          ) : (
            <>
              <div className={styles.noticesList}>
                {notices.map((notice, index) => {
                  const noticeType = getNoticeType(notice.title);
                  const isRecent = new Date(notice.created_at || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

                  return (
                    <article key={notice.id} className={styles.noticeCard}>
                      <div className={styles.noticeHeader}>
                        <div className={styles.noticeMeta}>
                          <span className={`${styles.noticeType} ${styles[noticeType.type]}`}>
                            {noticeType.label}
                          </span>
                          {isRecent && (
                            <span className={styles.newBadge}>
                              <Icon name="star" size={12} />
                              NEW
                            </span>
                          )}
                          <span className={styles.noticeDate}>
                            {formatDate(notice.created_at || '')}
                          </span>
                        </div>
                        <div className={styles.noticeNumber}>#{index + 1}</div>
                      </div>

                      <div className={styles.noticeContent}>
                        <h2 className={styles.noticeTitle}>
                          <Link to={`/notices/${notice.slug}`}>
                            {notice.title}
                          </Link>
                        </h2>

                        {notice.excerpt && (
                          <p className={styles.noticeExcerpt}>
                            {truncateContent(notice.excerpt)}
                          </p>
                        )}

                        <div className={styles.noticeActions}>
                          <Link
                            to={`/notices/${notice.slug}`}
                            className={styles.readMoreLink}
                          >
                            자세히 보기
                            <Icon name="arrowLeft" size={14} />
                          </Link>
                        </div>
                      </div>

                      {notice.featured_image && (
                        <div className={styles.noticeImage}>
                          <img
                            src={notice.featured_image}
                            alt={notice.title}
                            loading="lazy"
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
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

      <section className={styles.quickInfo}>
        <div className={styles.quickInfoContent}>
          <h2 className={styles.quickInfoTitle}>빠른 정보</h2>
          <div className={styles.quickInfoGrid}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="clock" size={32} />
              </div>
              <h3 className={styles.infoTitle}>진료시간</h3>
              <p className={styles.infoText}>
                평일 09:00-18:00<br />
                토요일 09:00-17:00<br />
                일요일 휴진
              </p>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="chat" size={32} />
              </div>
              <h3 className={styles.infoTitle}>문의전화</h3>
              <p className={styles.infoText}>
                02-1234-5678<br />
                진료시간 내 상담가능
              </p>
              <a href="tel:02-1234-5678" className={styles.callButton}>
                전화걸기
              </a>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="calendar" size={32} />
              </div>
              <h3 className={styles.infoTitle}>예약하기</h3>
              <p className={styles.infoText}>
                온라인으로 간편하게<br />
                예약하세요
              </p>
              <Link to="/reservation" className={styles.reserveButton}>
                예약하기
              </Link>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <Icon name="chat" size={32} />
              </div>
              <h3 className={styles.infoTitle}>상담문의</h3>
              <p className={styles.infoText}>
                1:1 맞춤 상담<br />
                서비스
              </p>
              <Link to="/consultation" className={styles.consultButton}>
                상담하기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NoticesPage;