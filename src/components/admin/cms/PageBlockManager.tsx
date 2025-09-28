import React, { useState, useEffect, useCallback } from 'react';
import { CMSService } from '../../../services/cms.service';
import type { PageBlock, BlockType, BlockFormData } from '../../../types';
import { Icon } from '../../icons';
import BlockEditor from './BlockEditor';
import styles from './PageBlockManager.module.css';

interface PageBlockManagerProps {
  pageId: string;
}

const PageBlockManager: React.FC<PageBlockManagerProps> = ({ pageId }) => {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const blockTypeLabels: Record<BlockType, string> = {
    text: '텍스트',
    image: '이미지',
    video: '비디오',
    gallery: '갤러리',
    cta: 'CTA 버튼',
    spacer: '여백',
    html: 'HTML',
  };

  const loadBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CMSService.getPageBlocks(pageId);

      if (result.success && result.data) {
        setBlocks(result.data);
      } else {
        setError(result.error || '블록 데이터를 불러올 수 없습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    loadBlocks();
  }, [loadBlocks]);

  const handleCreateBlock = async (blockData: BlockFormData) => {
    try {
      const result = await CMSService.createBlock(pageId, {
        ...blockData,
        sort_order: blocks.length + 1,
      });

      if (result.success) {
        await loadBlocks();
        setIsCreating(false);
      } else {
        setError(result.error || '블록 생성에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleUpdateBlock = async (blockId: string, blockData: Partial<BlockFormData>) => {
    try {
      const result = await CMSService.updateBlock(blockId, blockData);

      if (result.success) {
        await loadBlocks();
        setEditingBlock(null);
      } else {
        setError(result.error || '블록 업데이트에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!window.confirm('이 블록을 정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      const result = await CMSService.deleteBlock(blockId);

      if (result.success) {
        await loadBlocks();
      } else {
        setError(result.error || '블록 삭제에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleToggleVisibility = async (block: PageBlock) => {
    await handleUpdateBlock(block.id, { is_visible: !block.is_visible });
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedItem(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (!draggedItem) return;

    const draggedIndex = blocks.findIndex(block => block.id === draggedItem);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    // Reorder blocks array
    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedBlock);

    // Update sort_order for all blocks
    const reorderData = newBlocks.map((block, index) => ({
      id: block.id,
      sort_order: index + 1,
    }));

    try {
      await CMSService.reorderBlocks(pageId, reorderData.map(item => item.id));
      await loadBlocks();
    } catch (err) {
      setError(err instanceof Error ? err.message : '블록 순서 변경에 실패했습니다');
    }

    setDraggedItem(null);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon name="refresh" size="lg" />
        <span>블록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className={styles.blockManager}>
      <div className={styles.header}>
        <h3 className={styles.title}>콘텐츠 블록</h3>
        <button
          onClick={() => setIsCreating(true)}
          className={styles.addButton}
          disabled={isCreating}
        >
          <Icon name="plus" size="sm" />
          블록 추가
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {isCreating && (
        <div className={styles.blockItem}>
          <div className={styles.blockHeader}>
            <h4 className={styles.blockTitle}>새 블록 추가</h4>
            <button
              onClick={() => setIsCreating(false)}
              className={styles.cancelButton}
            >
              <Icon name="close" size="sm" />
            </button>
          </div>
          <BlockEditor
            onSave={handleCreateBlock}
            onCancel={() => setIsCreating(false)}
          />
        </div>
      )}

      <div className={styles.blocksList}>
        {blocks.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="dashboard" size="lg" />
            <p>아직 블록이 없습니다</p>
            <p>위의 "블록 추가" 버튼을 클릭하여 첫 번째 블록을 만들어보세요.</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className={`${styles.blockItem} ${!block.is_visible ? styles.hidden : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, block.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className={styles.blockHeader}>
                <div className={styles.blockInfo}>
                  <Icon name="menu" size="sm" className={styles.dragHandle} />
                  <span className={styles.blockType}>
                    {blockTypeLabels[block.block_type]}
                  </span>
                  <span className={styles.blockTitle}>
                    {block.title || '제목 없음'}
                  </span>
                  {!block.is_visible && (
                    <span className={styles.hiddenBadge}>숨김</span>
                  )}
                </div>
                <div className={styles.blockActions}>
                  <button
                    onClick={() => handleToggleVisibility(block)}
                    className={styles.actionButton}
                    title={block.is_visible ? '숨기기' : '보이기'}
                  >
                    <Icon name={block.is_visible ? 'view' : 'close'} size="sm" />
                  </button>
                  <button
                    onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                    className={styles.actionButton}
                    title="편집"
                  >
                    <Icon name="edit" size="sm" />
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className={styles.deleteButton}
                    title="삭제"
                  >
                    <Icon name="delete" size="sm" />
                  </button>
                </div>
              </div>

              {editingBlock === block.id && (
                <div className={styles.blockContent}>
                  <BlockEditor
                    block={block}
                    onSave={(blockData) => handleUpdateBlock(block.id, blockData)}
                    onCancel={() => setEditingBlock(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PageBlockManager;