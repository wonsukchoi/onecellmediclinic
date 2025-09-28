import React from 'react';
import styles from './BlockEditors.module.css';

interface CTABlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const CTABlockEditor: React.FC<CTABlockEditorProps> = ({
  content,
  styles: blockStyles,
  onContentChange,
  onStylesChange,
}) => {
  const handleContentChange = (field: string, value: string | boolean) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  const handleStyleChange = (field: string, value: string) => {
    onStylesChange({
      ...blockStyles,
      [field]: value,
    });
  };

  return (
    <div className={styles.blockEditor}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>CTA 버튼 설정</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>버튼 텍스트</label>
          <input
            type="text"
            value={content.text || ''}
            onChange={(e) => handleContentChange('text', e.target.value)}
            className={styles.input}
            placeholder="버튼에 표시될 텍스트"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>링크 URL</label>
          <input
            type="url"
            value={content.url || ''}
            onChange={(e) => handleContentChange('url', e.target.value)}
            className={styles.input}
            placeholder="https://example.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>제목 (선택사항)</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            className={styles.input}
            placeholder="CTA 섹션 제목"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>설명 (선택사항)</label>
          <textarea
            value={content.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            className={styles.textarea}
            placeholder="CTA 설명 텍스트"
            rows={3}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>스타일 설정</h4>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>정렬</label>
            <select
              value={blockStyles.alignment || 'center'}
              onChange={(e) => handleStyleChange('alignment', e.target.value)}
              className={styles.select}
            >
              <option value="left">왼쪽</option>
              <option value="center">가운데</option>
              <option value="right">오른쪽</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>버튼 크기</label>
            <select
              value={blockStyles.size || 'medium'}
              onChange={(e) => handleStyleChange('size', e.target.value)}
              className={styles.select}
            >
              <option value="small">작게</option>
              <option value="medium">보통</option>
              <option value="large">크게</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>버튼 색상</label>
            <select
              value={blockStyles.variant || 'primary'}
              onChange={(e) => handleStyleChange('variant', e.target.value)}
              className={styles.select}
            >
              <option value="primary">기본 (파란색)</option>
              <option value="secondary">보조 (회색)</option>
              <option value="success">성공 (녹색)</option>
              <option value="danger">위험 (빨간색)</option>
              <option value="warning">경고 (노란색)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={content.openInNewTab || false}
                onChange={(e) => handleContentChange('openInNewTab', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>새 탭에서 열기</span>
            </label>
          </div>
        </div>
      </div>

      {content.text && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>미리보기</h4>
          <div className={styles.preview}>
            <div
              style={{
                textAlign: blockStyles.alignment || 'center',
                padding: '20px',
              }}
            >
              {content.title && (
                <h3 style={{ margin: '0 0 8px 0' }}>{content.title}</h3>
              )}
              {content.description && (
                <p style={{ margin: '0 0 16px 0', color: '#6c757d' }}>
                  {content.description}
                </p>
              )}
              <button
                style={{
                  padding: blockStyles.size === 'small' ? '8px 16px' :
                          blockStyles.size === 'large' ? '16px 32px' : '12px 24px',
                  fontSize: blockStyles.size === 'small' ? '14px' :
                           blockStyles.size === 'large' ? '18px' : '16px',
                  backgroundColor: blockStyles.variant === 'secondary' ? '#6c757d' :
                                  blockStyles.variant === 'success' ? '#28a745' :
                                  blockStyles.variant === 'danger' ? '#dc3545' :
                                  blockStyles.variant === 'warning' ? '#ffc107' : '#0066cc',
                  color: blockStyles.variant === 'warning' ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {content.text}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTABlockEditor;