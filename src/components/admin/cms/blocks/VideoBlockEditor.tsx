import React from 'react';
import styles from './BlockEditors.module.css';

interface VideoBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const VideoBlockEditor: React.FC<VideoBlockEditorProps> = ({
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
        <h4 className={styles.sectionTitle}>비디오 설정</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>YouTube URL 또는 비디오 URL</label>
          <input
            type="url"
            value={content.url || ''}
            onChange={(e) => handleContentChange('url', e.target.value)}
            className={styles.input}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>제목 (선택사항)</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            className={styles.input}
            placeholder="비디오 제목"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>설명 (선택사항)</label>
          <textarea
            value={content.description || ''}
            onChange={(e) => handleContentChange('description', e.target.value)}
            className={styles.textarea}
            placeholder="비디오 설명"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoBlockEditor;