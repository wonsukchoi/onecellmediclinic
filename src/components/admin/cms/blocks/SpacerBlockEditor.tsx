import React from 'react';
import styles from './BlockEditors.module.css';

interface SpacerBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const SpacerBlockEditor: React.FC<SpacerBlockEditorProps> = ({
  content,
  onContentChange,
}) => {
  const handleContentChange = (field: string, value: string) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  return (
    <div className={styles.blockEditor}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>여백 설정</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>여백 크기</label>
          <select
            value={content.size || 'medium'}
            onChange={(e) => handleContentChange('size', e.target.value)}
            className={styles.select}
          >
            <option value="small">작게 (20px)</option>
            <option value="medium">보통 (40px)</option>
            <option value="large">크게 (60px)</option>
            <option value="extra-large">매우 크게 (100px)</option>
            <option value="custom">사용자 정의</option>
          </select>
        </div>

        {content.size === 'custom' && (
          <div className={styles.formGroup}>
            <label className={styles.label}>사용자 정의 높이 (px)</label>
            <input
              type="number"
              value={content.customHeight || '40'}
              onChange={(e) => handleContentChange('customHeight', e.target.value)}
              className={styles.input}
              min="1"
              max="500"
              placeholder="40"
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>배경색 (선택사항)</label>
          <input
            type="color"
            value={content.backgroundColor || '#ffffff'}
            onChange={(e) => handleContentChange('backgroundColor', e.target.value)}
            className={styles.colorInput}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>미리보기</h4>
        <div className={styles.preview}>
          <div
            style={{
              height: content.size === 'small' ? '20px' :
                     content.size === 'large' ? '60px' :
                     content.size === 'extra-large' ? '100px' :
                     content.size === 'custom' ? `${content.customHeight || 40}px` : '40px',
              backgroundColor: content.backgroundColor || 'transparent',
              border: '1px dashed #dee2e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6c757d',
              fontSize: '14px',
            }}
          >
            여백 영역 ({content.size === 'custom' ? `${content.customHeight || 40}px` :
                     content.size === 'small' ? '20px' :
                     content.size === 'large' ? '60px' :
                     content.size === 'extra-large' ? '100px' : '40px'})
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacerBlockEditor;