import React from 'react';
import styles from './BlockEditors.module.css';

interface TextBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const TextBlockEditor: React.FC<TextBlockEditorProps> = ({
  content,
  styles: blockStyles,
  onContentChange,
  onStylesChange,
}) => {
  const handleTextChange = (field: string, value: string) => {
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
        <h4 className={styles.sectionTitle}>텍스트 내용</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>제목 (선택사항)</label>
          <input
            type="text"
            value={content.heading || ''}
            onChange={(e) => handleTextChange('heading', e.target.value)}
            className={styles.input}
            placeholder="섹션 제목"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>내용</label>
          <textarea
            value={content.text || ''}
            onChange={(e) => handleTextChange('text', e.target.value)}
            className={styles.textarea}
            placeholder="텍스트 내용을 입력하세요"
            rows={8}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>스타일 설정</h4>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>텍스트 정렬</label>
            <select
              value={blockStyles.textAlign || 'left'}
              onChange={(e) => handleStyleChange('textAlign', e.target.value)}
              className={styles.select}
            >
              <option value="left">왼쪽 정렬</option>
              <option value="center">가운데 정렬</option>
              <option value="right">오른쪽 정렬</option>
              <option value="justify">양쪽 정렬</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>글자 크기</label>
            <select
              value={blockStyles.fontSize || 'medium'}
              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
              className={styles.select}
            >
              <option value="small">작게</option>
              <option value="medium">보통</option>
              <option value="large">크게</option>
              <option value="extra-large">매우 크게</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>배경색</label>
            <input
              type="color"
              value={blockStyles.backgroundColor || '#ffffff'}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className={styles.colorInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>텍스트 색상</label>
            <input
              type="color"
              value={blockStyles.textColor || '#000000'}
              onChange={(e) => handleStyleChange('textColor', e.target.value)}
              className={styles.colorInput}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>여백 (상하)</label>
          <select
            value={blockStyles.padding || 'medium'}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            className={styles.select}
          >
            <option value="none">없음</option>
            <option value="small">작게</option>
            <option value="medium">보통</option>
            <option value="large">크게</option>
          </select>
        </div>
      </div>

      {content.text && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>미리보기</h4>
          <div
            className={styles.preview}
            style={{
              textAlign: blockStyles.textAlign || 'left',
              fontSize: blockStyles.fontSize === 'small' ? '14px' :
                       blockStyles.fontSize === 'large' ? '18px' :
                       blockStyles.fontSize === 'extra-large' ? '22px' : '16px',
              backgroundColor: blockStyles.backgroundColor || '#ffffff',
              color: blockStyles.textColor || '#000000',
              padding: blockStyles.padding === 'small' ? '8px' :
                      blockStyles.padding === 'large' ? '24px' :
                      blockStyles.padding === 'none' ? '0' : '16px',
            }}
          >
            {content.heading && (
              <h3 style={{ margin: '0 0 12px 0' }}>{content.heading}</h3>
            )}
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {content.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextBlockEditor;