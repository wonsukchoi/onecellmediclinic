import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PatientsRightsPage.module.css';
import StaticPageSEO from '../components/SEO/StaticPageSEO';

const PatientsRightsPage: React.FC = () => {
  const { t } = useTranslation();

  useEffect(() => {
    // Reset scroll position when component mounts
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0; // For Safari
    
    // Fallback with timeout
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }, []);

  return (
    <>
      <StaticPageSEO
        title={t('patients_rights.title')}
        description={t('patients_rights.description')}
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>{t('patients_rights.title')}</h1>
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              &lt;{t('patients_rights.charter_title')}&gt;
            </h2>
            
            <div className={styles.rightsSection}>
              <h3 className={styles.subTitle}>{t('patients_rights.rights_title')}</h3>
              
              <ol className={styles.rightsList}>
                <li className={styles.rightsItem}>
                  <strong>{t('patients_rights.right1_title')}</strong>
                  <p>{t('patients_rights.right1_content')}</p>
                </li>
                <li className={styles.rightsItem}>
                  <strong>{t('patients_rights.right2_title')}</strong>
                  <p>{t('patients_rights.right2_content')}</p>
                </li>
                <li className={styles.rightsItem}>
                  <strong>{t('patients_rights.right3_title')}</strong>
                  <p>{t('patients_rights.right3_content')}</p>
                </li>
                <li className={styles.rightsItem}>
                  <strong>{t('patients_rights.right4_title')}</strong>
                  <p>{t('patients_rights.right4_content')}</p>
                </li>
              </ol>
            </div>
            
            <div className={styles.obligationsSection}>
              <h3 className={styles.subTitle}>{t('patients_rights.obligations_title')}</h3>
              
              <ol className={styles.obligationsList}>
                <li className={styles.obligationsItem}>
                  <strong>{t('patients_rights.obligation1_title')}</strong>
                  <p>{t('patients_rights.obligation1_content')}</p>
                </li>
                <li className={styles.obligationsItem}>
                  <strong>{t('patients_rights.obligation2_title')}</strong>
                  <p>{t('patients_rights.obligation2_content')}</p>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientsRightsPage;
