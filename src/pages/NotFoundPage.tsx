import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.errorTitle}>페이지를 찾을 수 없습니다</h1>
        <p className={styles.errorMessage}>
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            홈으로 돌아가기
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            이전 페이지로
          </button>
        </div>
        <div className={styles.suggestions}>
          <h3>다음 페이지를 확인해보세요:</h3>
          <ul>
            <li><Link to="/procedures">시술 안내</Link></li>
            <li><Link to="/consultation">온라인 상담</Link></li>
            <li><Link to="/reservation">예약하기</Link></li>
            <li><Link to="/about">클리닉 소개</Link></li>
            <li><Link to="/contact">연락처</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;