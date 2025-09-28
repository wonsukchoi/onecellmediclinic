import React, { useState, useEffect } from 'react';
import type { PageBlock, BlockType, BlockFormData } from '../../../types';
import { Icon } from '../../icons';
import TextBlockEditor from './blocks/TextBlockEditor';
import ImageBlockEditor from './blocks/ImageBlockEditor';
import VideoBlockEditor from './blocks/VideoBlockEditor';
import GalleryBlockEditor from './blocks/GalleryBlockEditor';
import CTABlockEditor from './blocks/CTABlockEditor';
import SpacerBlockEditor from './blocks/SpacerBlockEditor';
import HTMLBlockEditor from './blocks/HTMLBlockEditor';
import styles from './BlockEditor.module.css';

interface BlockEditorProps {
  block?: PageBlock;
  onSave: (blockData: BlockFormData) => void;
  onCancel: () => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onSave, onCancel }) => {
  const [blockType, setBlockType] = useState<BlockType>(block?.block_type || 'text');
  const [title, setTitle] = useState(block?.title || '');
  const [content, setContent] = useState(block?.content || {});
  const [blockStyles, setBlockStyles] = useState(block?.styles || {});
  const [isVisible, setIsVisible] = useState(block?.is_visible ?? true);
  const [saving, setSaving] = useState(false);

  const blockTypeOptions: { value: BlockType; label: string; description: string }[] = [
    { value: 'text', label: '텍스트', description: '일반 텍스트 및 서식 있는 콘텐츠' },
    { value: 'image', label: '이미지', description: '단일 이미지와 캡션' },
    { value: 'video', label: '비디오', description: 'YouTube 또는 직접 업로드 비디오' },
    { value: 'gallery', label: '갤러리', description: '여러 이미지 갤러리' },
    { value: 'cta', label: 'CTA 버튼', description: '행동 유도 버튼' },
    { value: 'spacer', label: '여백', description: '섹션 간 여백 공간' },
    { value: 'html', label: 'HTML', description: '커스텀 HTML 코드' },
  ];

  useEffect(() => {
    if (block) {
      setBlockType(block.block_type);
      setTitle(block.title || '');
      setContent(block.content || {});
      setBlockStyles(block.styles || {});
      setIsVisible(block.is_visible);
    }
  }, [block]);

  const handleContentChange = (newContent: Record<string, any>) => {
    setContent(newContent);
  };

  const handleStylesChange = (newStyles: Record<string, any>) => {
    setBlockStyles(newStyles);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const blockData: BlockFormData = {
        block_type: blockType,
        title,
        content,
        styles: blockStyles,
        sort_order: block?.sort_order || 1,
        is_visible: isVisible,
      };

      await onSave(blockData);
    } catch (err) {
      console.error('Error saving block:', err);
    } finally {
      setSaving(false);
    }
  };

  const renderBlockEditor = () => {
    const commonProps = {
      content,
      styles: blockStyles,
      onContentChange: handleContentChange,
      onStylesChange: handleStylesChange,
    };

    switch (blockType) {
      case 'text':
        return <TextBlockEditor {...commonProps} />;
      case 'image':
        return <ImageBlockEditor {...commonProps} />;
      case 'video':
        return <VideoBlockEditor {...commonProps} />;
      case 'gallery':
        return <GalleryBlockEditor {...commonProps} />;
      case 'cta':
        return <CTABlockEditor {...commonProps} />;
      case 'spacer':
        return <SpacerBlockEditor {...commonProps} />;
      case 'html':
        return <HTMLBlockEditor {...commonProps} />;
      default:
        return <div>지원되지 않는 블록 타입입니다.</div>;
    }
  };

  return (
    <div className={styles.blockEditor}>
      <div className={styles.editorHeader}>
        <div className={styles.headerRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>블록 타입</label>
            <select
              value={blockType}
              onChange={(e) => setBlockType(e.target.value as BlockType)}
              className={styles.select}
              disabled={!!block} // Don't allow changing type for existing blocks
            >
              {blockTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>블록 제목 (선택사항)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="블록을 식별하기 위한 제목"
            />
          </div>
        </div>

        <div className={styles.headerRow}>
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>블록 표시</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.editorContent}>
        {renderBlockEditor()}
      </div>

      <div className={styles.editorFooter}>
        <button
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={saving}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <>
              <Icon name="refresh" size="sm" />
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </button>
      </div>
    </div>
  );
};

export default BlockEditor;