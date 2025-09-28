import React from 'react';
import styles from './BlockEditors.module.css';

interface ImageBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const ImageBlockEditor: React.FC<ImageBlockEditorProps> = ({
  content,
  styles: blockStyles,
  onContentChange,
  onStylesChange,
}) => {
  const handleContentChange = (field: string, value: string) => {
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
        <h4 className={styles.sectionTitle}>이미지 설정</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>이미지 URL</label>
          <input
            type="url"
            value={content.src || ''}
            onChange={(e) => handleContentChange('src', e.target.value)}
            className={styles.input}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>대체 텍스트 (Alt)</label>
          <input
            type="text"
            value={content.alt || ''}
            onChange={(e) => handleContentChange('alt', e.target.value)}
            className={styles.input}
            placeholder="이미지 설명"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>캡션 (선택사항)</label>
          <input
            type="text"
            value={content.caption || ''}
            onChange={(e) => handleContentChange('caption', e.target.value)}
            className={styles.input}
            placeholder="이미지 캡션"
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
            <label className={styles.label}>크기</label>
            <select
              value={blockStyles.size || 'medium'}
              onChange={(e) => handleStyleChange('size', e.target.value)}
              className={styles.select}
            >
              <option value="small">작게 (300px)</option>
              <option value="medium">보통 (600px)</option>
              <option value="large">크게 (800px)</option>
              <option value="full">전체 너비</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>테두리 반경</label>
          <select
            value={blockStyles.borderRadius || 'none'}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            className={styles.select}
          >
            <option value="none">없음</option>
            <option value="small">작게</option>
            <option value="medium">보통</option>
            <option value="large">크게</option>
            <option value="round">원형</option>
          </select>
        </div>
      </div>

      {content.src && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>미리보기</h4>
          <div className={styles.preview}>
            <div
              style={{
                textAlign: blockStyles.alignment || 'center',
                padding: '16px',
              }}
            >
              <img
                src={content.src}
                alt={content.alt || ''}
                style={{
                  maxWidth: blockStyles.size === 'small' ? '300px' :
                          blockStyles.size === 'medium' ? '600px' :
                          blockStyles.size === 'large' ? '800px' : '100%',
                  width: blockStyles.size === 'full' ? '100%' : 'auto',
                  height: 'auto',
                  borderRadius: blockStyles.borderRadius === 'small' ? '4px' :
                              blockStyles.borderRadius === 'medium' ? '8px' :
                              blockStyles.borderRadius === 'large' ? '12px' :
                              blockStyles.borderRadius === 'round' ? '50%' : '0',
                }}
              />
              {content.caption && (
                <p style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  color: '#6c757d',
                  fontStyle: 'italic',
                }}>
                  {content.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageBlockEditor;