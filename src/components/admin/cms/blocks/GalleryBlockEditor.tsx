import React from 'react';
import styles from './BlockEditors.module.css';

interface GalleryBlockEditorProps {
  content: Record<string, any>;
  styles: Record<string, any>;
  onContentChange: (content: Record<string, any>) => void;
  onStylesChange: (styles: Record<string, any>) => void;
}

const GalleryBlockEditor: React.FC<GalleryBlockEditorProps> = ({
  content,
  onContentChange,
}) => {
  const handleContentChange = (field: string, value: any) => {
    onContentChange({
      ...content,
      [field]: value,
    });
  };

  const handleImageChange = (index: number, field: string, value: string) => {
    const images = [...(content.images || [])];
    images[index] = { ...images[index], [field]: value };
    handleContentChange('images', images);
  };

  const addImage = () => {
    const images = [...(content.images || [])];
    images.push({ src: '', alt: '', caption: '' });
    handleContentChange('images', images);
  };

  const removeImage = (index: number) => {
    const images = [...(content.images || [])];
    images.splice(index, 1);
    handleContentChange('images', images);
  };

  return (
    <div className={styles.blockEditor}>
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>갤러리 설정</h4>

        <div className={styles.formGroup}>
          <label className={styles.label}>갤러리 제목 (선택사항)</label>
          <input
            type="text"
            value={content.title || ''}
            onChange={(e) => handleContentChange('title', e.target.value)}
            className={styles.input}
            placeholder="갤러리 제목"
          />
        </div>

        <div className={styles.formGroup}>
          <div className={styles.imageList}>
            <div className={styles.imageListHeader}>
              <label className={styles.label}>이미지 목록</label>
              <button
                type="button"
                onClick={addImage}
                className={styles.addButton}
              >
                + 이미지 추가
              </button>
            </div>

            {(content.images || []).map((image: any, index: number) => (
              <div key={index} className={styles.imageItem}>
                <div className={styles.imageItemHeader}>
                  <span>이미지 {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeButton}
                  >
                    삭제
                  </button>
                </div>
                <div className={styles.imageItemContent}>
                  <input
                    type="url"
                    value={image.src || ''}
                    onChange={(e) => handleImageChange(index, 'src', e.target.value)}
                    className={styles.input}
                    placeholder="이미지 URL"
                  />
                  <input
                    type="text"
                    value={image.alt || ''}
                    onChange={(e) => handleImageChange(index, 'alt', e.target.value)}
                    className={styles.input}
                    placeholder="대체 텍스트"
                  />
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                    className={styles.input}
                    placeholder="캡션 (선택사항)"
                  />
                </div>
              </div>
            ))}

            {(!content.images || content.images.length === 0) && (
              <div className={styles.emptyState}>
                <p>아직 이미지가 없습니다. "이미지 추가" 버튼을 클릭하여 갤러리를 만들어보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryBlockEditor;