import React from 'react';
import type { HeaderNavigation } from '../../../types';
import { Icon } from '../../icons';
import styles from './NavigationTreeItem.module.css';

interface NavigationTreeItemProps {
  item: HeaderNavigation;
  level: number;
  expanded: boolean;
  onToggleExpanded: (itemId: string) => void;
  onEdit: (item: HeaderNavigation) => void;
  onDelete: (item: HeaderNavigation) => void;
  onToggleVisibility: (item: HeaderNavigation) => void;
  onReorder: (items: HeaderNavigation[]) => void;
}

const NavigationTreeItem: React.FC<NavigationTreeItemProps> = ({
  item,
  level,
  expanded,
  onToggleExpanded,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const indentStyle = { paddingLeft: `${level * 20 + 16}px` };

  const getNavTypeLabel = (navType: string) => {
    switch (navType) {
      case 'link': return '링크';
      case 'dropdown': return '드롭다운';
      case 'megamenu': return '메가메뉴';
      case 'divider': return '구분선';
      default: return navType;
    }
  };

  const getAccessLevelLabel = (accessLevel: string) => {
    switch (accessLevel) {
      case 'public': return '공개';
      case 'member': return '회원';
      case 'admin': return '관리자';
      default: return accessLevel;
    }
  };

  return (
    <div className={styles.treeItem}>
      <div
        className={`${styles.itemContent} ${!item.is_visible ? styles.hidden : ''}`}
        style={indentStyle}
      >
        <div className={styles.itemLeft}>
          {hasChildren ? (
            <button
              onClick={() => onToggleExpanded(item.id)}
              className={styles.expandButton}
            >
              <Icon
                name={expanded ? 'chevronDown' : 'chevronRight'}
                size="sm"
              />
            </button>
          ) : (
            <div className={styles.expandSpacer} />
          )}

          <Icon name="menu" size="sm" className={styles.dragHandle} />

          <div className={styles.itemInfo}>
            <div className={styles.itemLabel}>
              {item.label}
              {!item.is_visible && (
                <span className={styles.hiddenBadge}>숨김</span>
              )}
            </div>
            <div className={styles.itemMeta}>
              <span className={styles.navType}>
                {getNavTypeLabel(item.nav_type)}
              </span>
              <span className={styles.accessLevel}>
                {getAccessLevelLabel(item.access_level)}
              </span>
              {item.url && (
                <span className={styles.url}>
                  {item.url}
                </span>
              )}
              {item.target_blank && (
                <span className={styles.newTab}>새 탭</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.itemActions}>
          <button
            onClick={() => onToggleVisibility(item)}
            className={styles.actionButton}
            title={item.is_visible ? '숨기기' : '보이기'}
          >
            <Icon name={item.is_visible ? 'view' : 'close'} size="sm" />
          </button>
          <button
            onClick={() => onEdit(item)}
            className={styles.actionButton}
            title="편집"
          >
            <Icon name="edit" size="sm" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className={styles.deleteButton}
            title="삭제"
          >
            <Icon name="delete" size="sm" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className={styles.children}>
          {item.children!.map(child => (
            <NavigationTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              expanded={expanded}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
              onReorder={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NavigationTreeItem;