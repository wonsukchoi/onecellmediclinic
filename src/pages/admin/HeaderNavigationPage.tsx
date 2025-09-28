import React, { useState, useEffect, useCallback } from 'react';
import { CMSService } from '../../services/cms.service';
import type { HeaderNavigation, NavigationFormData } from '../../types';
import { Icon } from '../../components/icons';
import NavigationTreeItem from '../../components/admin/cms/NavigationTreeItem';
import NavigationForm from '../../components/admin/cms/NavigationForm';
import styles from './HeaderNavigationPage.module.css';

const HeaderNavigationPage: React.FC = () => {
  const [navigation, setNavigation] = useState<HeaderNavigation[]>([]);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<HeaderNavigation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const loadNavigation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await CMSService.getNavigation();

      if (result.success && result.data) {
        setNavigation(result.data);
      } else {
        setError(result.error || '네비게이션 데이터를 불러올 수 없습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPages = useCallback(async () => {
    try {
      const result = await CMSService.getPages({ limit: 1000 });
      if (result.success && result.data) {
        setAllPages(result.data.data);
      }
    } catch (err) {
      console.error('Failed to load pages:', err);
    }
  }, []);

  useEffect(() => {
    loadNavigation();
    loadPages();
  }, [loadNavigation, loadPages]);

  const handleCreateItem = async (formData: NavigationFormData) => {
    try {
      const result = await CMSService.createNavigationItem(formData);

      if (result.success) {
        await loadNavigation();
        setIsCreating(false);
      } else {
        setError(result.error || '네비게이션 항목 생성에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleUpdateItem = async (id: string, formData: Partial<NavigationFormData>) => {
    try {
      const result = await CMSService.updateNavigationItem(id, formData);

      if (result.success) {
        await loadNavigation();
        setEditingItem(null);
      } else {
        setError(result.error || '네비게이션 항목 업데이트에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleDeleteItem = async (item: HeaderNavigation) => {
    if (!window.confirm(`"${item.label}" 항목을 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await CMSService.deleteNavigationItem(item.id);

      if (result.success) {
        await loadNavigation();
      } else {
        setError(result.error || '네비게이션 항목 삭제에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleToggleVisibility = async (item: HeaderNavigation) => {
    await handleUpdateItem(item.id, { is_visible: !item.is_visible });
  };

  const handleReorder = async (items: HeaderNavigation[]) => {
    try {
      const reorderData = items.map((item, index) => ({
        id: item.id,
        sort_order: index + 1,
      }));

      const result = await CMSService.reorderNavigationItems(reorderData);

      if (result.success) {
        await loadNavigation();
      } else {
        setError(result.error || '항목 순서 변경에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleToggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const buildNavigationTree = (items: HeaderNavigation[], parentId: string | null = null): HeaderNavigation[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        children: buildNavigationTree(items, item.id),
      }));
  };

  const flattenNavigationTree = (items: HeaderNavigation[]): HeaderNavigation[] => {
    const result: HeaderNavigation[] = [];

    const traverse = (items: HeaderNavigation[], level = 0) => {
      items.forEach(item => {
        result.push({ ...item });
        if (item.children && item.children.length > 0) {
          traverse(item.children, level + 1);
        }
      });
    };

    traverse(items);
    return result;
  };

  const navigationTree = buildNavigationTree(navigation);
  const flatNavigation = flattenNavigationTree(navigationTree);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon name="refresh" size="lg" />
        <span>네비게이션을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className={styles.navigationPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>헤더 네비게이션 관리</h1>
          <p className={styles.pageDescription}>
            웹사이트 헤더에 표시될 메뉴 항목을 관리합니다. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.
          </p>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => setIsCreating(true)}
            className={styles.createButton}
            disabled={isCreating}
          >
            <Icon name="plus" size="sm" />
            메뉴 항목 추가
          </button>
          <button
            onClick={loadNavigation}
            className={styles.refreshButton}
            disabled={loading}
          >
            <Icon name="refresh" size="sm" />
            새로고침
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.navigationPanel}>
          <div className={styles.panelHeader}>
            <h3 className={styles.panelTitle}>메뉴 구조</h3>
            <div className={styles.panelActions}>
              <button
                onClick={() => setExpandedItems(new Set(navigation.map(item => item.id)))}
                className={styles.expandButton}
              >
                모두 펼치기
              </button>
              <button
                onClick={() => setExpandedItems(new Set())}
                className={styles.collapseButton}
              >
                모두 접기
              </button>
            </div>
          </div>

          <div className={styles.navigationTree}>
            {navigationTree.length === 0 ? (
              <div className={styles.emptyState}>
                <Icon name="menu" size="lg" />
                <p>아직 메뉴 항목이 없습니다</p>
                <p>위의 "메뉴 항목 추가" 버튼을 클릭하여 첫 번째 메뉴를 만들어보세요.</p>
              </div>
            ) : (
              navigationTree.map(item => (
                <NavigationTreeItem
                  key={item.id}
                  item={item}
                  level={0}
                  expanded={expandedItems.has(item.id)}
                  onToggleExpanded={handleToggleExpanded}
                  onEdit={setEditingItem}
                  onDelete={handleDeleteItem}
                  onToggleVisibility={handleToggleVisibility}
                  onReorder={handleReorder}
                />
              ))
            )}
          </div>
        </div>

        <div className={styles.formPanel}>
          {isCreating ? (
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>새 메뉴 항목 추가</h3>
                <button
                  onClick={() => setIsCreating(false)}
                  className={styles.closeButton}
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
              <NavigationForm
                navigationItems={flatNavigation}
                pages={allPages}
                onSubmit={handleCreateItem}
                onCancel={() => setIsCreating(false)}
              />
            </div>
          ) : editingItem ? (
            <div className={styles.formContainer}>
              <div className={styles.formHeader}>
                <h3 className={styles.formTitle}>메뉴 항목 수정</h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className={styles.closeButton}
                >
                  <Icon name="close" size="sm" />
                </button>
              </div>
              <NavigationForm
                item={editingItem}
                navigationItems={flatNavigation.filter(item => item.id !== editingItem.id)}
                pages={allPages}
                onSubmit={(formData) => handleUpdateItem(editingItem.id, formData)}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          ) : (
            <div className={styles.placeholderContainer}>
              <div className={styles.placeholder}>
                <Icon name="edit" size="lg" />
                <h3>메뉴 항목 선택</h3>
                <p>왼쪽에서 메뉴 항목을 선택하여 편집하거나,</p>
                <p>새로운 메뉴 항목을 추가해보세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderNavigationPage;