import React from 'react';
import styles from './BlockEditors.module.css';

interface HTMLBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const HTMLBlockEditor: React.FC<HTMLBlockEditorProps> = ({
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
        <h4 className={styles.sectionTitle}>HTML 코드</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>HTML 코드</label>
          <textarea
            value={content.html || ''}
            onChange={(e) => handleContentChange('html', e.target.value)}
            className={`${styles.textarea} ${styles.codeTextarea}`}
            placeholder="<!-- HTML 코드를 입력하세요 -->"
            rows={12}
          />
        </div>

        <div className={styles.warningBox}>
          <strong>⚠️ 주의사항:</strong>
          <ul>
            <li>악성 스크립트나 unsafe한 코드를 입력하지 마세요.</li>
            <li>외부 스크립트 로드 시 신뢰할 수 있는 소스인지 확인하세요.</li>
            <li>HTML 코드는 페이지에 직접 삽입되므로 신중히 작성하세요.</li>
          </ul>
        </div>
      </div>

      {content.html && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>코드 미리보기</h4>
          <div className={styles.codePreview}>
            <pre className={styles.codeBlock}>
              <code>{content.html}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default HTMLBlockEditor;