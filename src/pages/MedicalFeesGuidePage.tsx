import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MedicalFeesGuidePage.module.css';

interface FeeItem {
  category: string;
  code?: string;
  detail: string;
  unit: string;
  price: string;
}

const MedicalFeesGuidePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isKorean = i18n.language === 'kr';

  // Medical fees data
  const feeData: FeeItem[] = [
    { category: '진찰료', code: '', detail: '초진 진찰료', unit: '1회', price: '17,610' },
    { category: '진찰료', code: '', detail: '재진 진찰료', unit: '1회', price: '12,590' },
    { category: '진찰료', code: '', detail: '초진 야간 진찰료', unit: '1회', price: '21,980' },
    { category: '진찰료', code: '', detail: '재진 야간 진찰료', unit: '1회', price: '15,340' },
    { category: '진찰료', code: '', detail: '외국인 진찰료', unit: '1회', price: '30,000' },
    { category: '상담비', code: '', detail: '상담비', unit: '1회', price: '3~50,000' },
    { category: '제증명수수료', code: '', detail: '영문 일반진단서', unit: '1장', price: '20,000' },
    { category: '제증명수수료', code: '', detail: '일반진단서', unit: '1장', price: '20,000' },
    { category: '제증명수수료', code: '', detail: '후유장애진단서', unit: '1장', price: '100,000' },
    { category: '제증명수수료', code: '', detail: '병무용 진단서', unit: '1장', price: '20,000' },
    { category: '제증명수수료', code: '', detail: '입퇴원확인서', unit: '1장', price: '2,000' },
    { category: '제증명수수료', code: '', detail: '진료확인서', unit: '1장', price: '2,000' },
    { category: '제증명수수료', code: '', detail: '수술확인서', unit: '1장', price: '2,000' },
    { category: '제증명수수료', code: '', detail: '상해진단서 (3주미만)', unit: '1장', price: '50,000' },
    { category: '제증명수수료', code: '', detail: '상해진단서 (3주이상)', unit: '1장', price: '100,000' },
    { category: '제증명수수료', code: '', detail: '향후진료비추정서(1000만원미만)', unit: '1장', price: '50,000' },
    { category: '제증명수수료', code: '', detail: '향후진료비추정서(1000만원이상)', unit: '1장', price: '100,000' },
    { category: '제증명수수료', code: '', detail: '소견서', unit: '1장', price: '3,000' },
    { category: '제증명수수료', code: '', detail: '영문 소견서', unit: '1장', price: '10,000' },
    { category: '제증명수수료', code: '', detail: '영수증', unit: '1장', price: '2,000' },
    { category: '제증명수수료', code: '', detail: '진료기록사본-1~5매', unit: '', price: '1,000' },
    { category: '제증명수수료', code: '', detail: '진료기록사본-6매 이상', unit: '', price: '500' },
    { category: '제증명수수료', code: '', detail: '제증명서 사본(재발급)', unit: '1장', price: '1,000' },
    { category: '주사제', code: '', detail: '멜스몬', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '하이코민', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '푸르설티아민', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '지씨엔에이씨', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '신데렐라', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '백옥', unit: '1회', price: '190,000' },
    { category: '주사제', code: '', detail: '히씨파겐시', unit: '1회', price: '190,000' },
    { category: '엠디크림', code: 'BM5000VU', detail: '베리덤크림엠디', unit: '1개', price: '65,000' },
    { category: '엠디크림', code: 'BM5001VU', detail: '베리덤로션엠디', unit: '1개', price: '65,000' },
    { category: '엠디크림', code: 'BM5002VU', detail: '베리덤선크림엠디', unit: '1개', price: '65,000' },
    { category: '시술', code: '', detail: '보톡스-국산', unit: '', price: '40,000~' },
    { category: '시술', code: '', detail: '보톡스-독일산', unit: '', price: '70,000~' },
    { category: '시술', code: '', detail: '필러-국산', unit: '', price: '270,000~' },
    { category: '시술', code: '', detail: '필러-수입산', unit: '', price: '490,000~' },
    { category: '시술', code: '', detail: '비만시술', unit: '', price: '720,000~' },
    { category: '시술', code: '', detail: '브이올렛 주사', unit: '1ample', price: '440,000' },
    { category: '시술', code: '', detail: '삭센다 처방', unit: '1pen', price: '120,000' },
    { category: '시술', code: '', detail: '실리프팅', unit: '', price: '2,200,000~' },
    { category: '시술', code: '', detail: '금실 리프팅', unit: '', price: '1,500,000~' },
    { category: '시술', code: '', detail: '줄기세포 배양액 시술', unit: '', price: '490,000~' },
    { category: '시술', code: '', detail: '리쥬란', unit: '', price: '45,000~' },
    { category: '시술', code: '', detail: '여드름관리', unit: '', price: '200,000~' },
    { category: '시술', code: '', detail: '마음대로 팩관리', unit: '', price: '170,000~' },
    { category: '시술', code: '', detail: '토닝관리', unit: '', price: '200,000~' },
    { category: '시술', code: '', detail: '주름 및 모공관리', unit: '', price: '2,200,000~' },
    { category: '시술', code: '', detail: '줄기세포 시술', unit: '', price: '1,500,000~' },
    { category: '시술', code: '', detail: '줄기세포 뱅킹', unit: '', price: '900,000~' },
    { category: '상급병실료', code: 'ABZ020001', detail: '상급병실료/2인실', unit: '', price: '90,000' },
    { category: '이학요법료', code: 'MY1420000', detail: '증식치료/사지관절부위', unit: '', price: '500,000' },
    { category: '이학요법료', code: 'MY1430000', detail: '증식치료/척추부위', unit: '', price: '1,000,000' },
  ];

  // Group data by category
  const groupedData: { [key: string]: FeeItem[] } = {};
  feeData.forEach(item => {
    if (!groupedData[item.category]) {
      groupedData[item.category] = [];
    }
    groupedData[item.category].push(item);
  });

  // Get unique categories
  const categories = Object.keys(groupedData);

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {isKorean ? '비급여 진료비용 안내' : 'Non-Covered Medical Fees Guide'}
          </h1>
          <p className={styles.heroDescription}>
            {isKorean ? '투명하고 합리적인 가격으로 최고의 서비스를 제공합니다' : 'We provide the best service with transparent and reasonable prices'}
          </p>
        </div>
      </section>

      <section className={styles.feesSection}>
        <div className={styles.feesContent}>
          <div className={styles.tableContainer}>
            <table className={styles.feesTable}>
              <thead>
                <tr>
                  <th>{isKorean ? '기본항목' : 'Category'}</th>
                  <th>{isKorean ? '코드' : 'Code'}</th>
                  <th>{isKorean ? '세부항목' : 'Detail'}</th>
                  <th>{isKorean ? '단위' : 'Unit'}</th>
                  <th>{isKorean ? '가격(단위:원)' : 'Price (KRW)'}</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <React.Fragment key={category}>
                    {groupedData[category].map((item, index) => (
                      <tr key={`${category}-${index}`} className={index === 0 ? styles.categoryStart : ''}>
                        {index === 0 ? (
                          <td rowSpan={groupedData[category].length} className={styles.categoryCell}>
                            {item.category}
                          </td>
                        ) : null}
                        <td className={styles.codeCell}>{item.code}</td>
                        <td className={styles.detailCell}>{item.detail}</td>
                        <td className={styles.unitCell}>{item.unit}</td>
                        <td className={styles.priceCell}>{item.price}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={styles.notice}>
        <div className={styles.noticeContent}>
          <div className={styles.noticeCard}>
            <div className={styles.noticeIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div className={styles.noticeText}>
              <h3>{isKorean ? '비급여 진료비용 안내 유의사항' : 'Important Notes on Non-Covered Medical Fees'}</h3>
              <ul>
                <li>{isKorean ? '표시된 가격은 기본 시술 기준이며, 개인의 상태에 따라 달라질 수 있습니다.' : 'Listed prices are based on standard procedures and may vary depending on individual conditions.'}</li>
                <li>{isKorean ? '정확한 비용은 전문의 상담 후 확정됩니다.' : 'Exact costs are determined after consultation with a specialist.'}</li>
                <li>{isKorean ? '모든 시술은 사전 상담이 필요합니다.' : 'All procedures require prior consultation.'}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MedicalFeesGuidePage;
