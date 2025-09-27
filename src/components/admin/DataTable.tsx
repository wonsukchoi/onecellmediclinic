import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    field: string;
    direction: 'asc' | 'desc';
    onSort: (field: string, direction: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedItems: T[];
    onSelectionChange: (items: T[]) => void;
    getItemId: (item: T) => string | number;
  };
  search?: {
    value: string;
    placeholder?: string;
    onSearch: (value: string) => void;
  };
  actions?: {
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    customActions?: Array<{
      label: string;
      icon?: string;
      onClick: (item: T) => void;
      className?: string;
    }>;
  };
  bulkActions?: Array<{
    label: string;
    icon?: string;
    onClick: (selectedItems: T[]) => void;
    className?: string;
  }>;
  emptyMessage?: string;
  className?: string;
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  selection,
  search,
  actions,
  bulkActions,
  emptyMessage = 'No data available',
  className,
}: DataTableProps<T>) => {
  const [searchValue, setSearchValue] = useState(search?.value || '');

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return data.every(item =>
      selection.selectedItems.some(selected =>
        selection.getItemId(selected) === selection.getItemId(item)
      )
    );
  }, [selection, data]);

  const isIndeterminate = useMemo(() => {
    if (!selection || data.length === 0) return false;
    const selectedCount = data.filter(item =>
      selection.selectedItems.some(selected =>
        selection.getItemId(selected) === selection.getItemId(item)
      )
    ).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [selection, data]);

  const handleSort = (field: string) => {
    if (!sorting || !sorting.onSort) return;

    const newDirection =
      sorting.field === field && sorting.direction === 'asc' ? 'desc' : 'asc';
    sorting.onSort(field, newDirection);
  };

  const handleSelectAll = () => {
    if (!selection) return;

    if (isAllSelected) {
      selection.onSelectionChange([]);
    } else {
      selection.onSelectionChange(data);
    }
  };

  const handleSelectItem = (item: T) => {
    if (!selection) return;

    const itemId = selection.getItemId(item);
    const isSelected = selection.selectedItems.some(selected =>
      selection.getItemId(selected) === itemId
    );

    if (isSelected) {
      selection.onSelectionChange(
        selection.selectedItems.filter(selected =>
          selection.getItemId(selected) !== itemId
        )
      );
    } else {
      selection.onSelectionChange([...selection.selectedItems, item]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (search?.onSearch) {
      search.onSearch(value);
    }
  };

  const getSortIcon = (field: string) => {
    if (!sorting || sorting.field !== field) return '↕️';
    return sorting.direction === 'asc' ? '↑' : '↓';
  };

  const renderCellValue = (column: Column<T>, item: T, index: number) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item, index);
    }

    if (value === null || value === undefined) {
      return <span className={styles.nullValue}>—</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`${styles.badge} ${value ? styles.success : styles.error}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (typeof value === 'string' && value.startsWith('http') && (value.includes('.jpg') || value.includes('.png') || value.includes('.gif'))) {
      return <img src={value} alt="" className={styles.thumbnail} />;
    }

    return String(value);
  };

  return (
    <div className={`${styles.dataTable} ${className || ''}`}>
      {/* Header with Search and Bulk Actions */}
      {(search || (bulkActions && selection && selection.selectedItems.length > 0)) && (
        <div className={styles.tableHeader}>
          {search && (
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder={search.placeholder || 'Search...'}
                value={searchValue}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          )}

          {bulkActions && selection && selection.selectedItems.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectionCount}>
                {selection.selectedItems.length} selected
              </span>
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selection.selectedItems)}
                  className={`${styles.bulkActionBtn} ${action.className || ''}`}
                >
                  {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {selection && (
                <th className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={ref => {
                      if (ref) ref.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`${styles.th} ${column.align ? styles[column.align] : ''} ${
                    column.sortable ? styles.sortable : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className={styles.headerContent}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className={styles.sortIcon}>{getSortIcon(column.key)}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className={styles.actionsColumn}>Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)} className={styles.loadingCell}>
                  <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selection ? 1 : 0) + (actions ? 1 : 0)} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const isSelected = selection?.selectedItems.some(selected =>
                  selection.getItemId(selected) === selection.getItemId(item)
                ) || false;

                return (
                  <tr key={selection?.getItemId(item) || index} className={isSelected ? styles.selected : ''}>
                    {selection && (
                      <td className={styles.checkboxColumn}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(item)}
                          className={styles.checkbox}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`${styles.td} ${column.align ? styles[column.align] : ''}`}
                      >
                        {renderCellValue(column, item, index)}
                      </td>
                    ))}
                    {actions && (
                      <td className={styles.actionsColumn}>
                        <div className={styles.actionButtons}>
                          {actions.onView && (
                            <button
                              onClick={() => actions.onView!(item)}
                              className={`${styles.actionBtn} ${styles.view}`}
                              title="View"
                            >
                              👁️
                            </button>
                          )}
                          {actions.onEdit && (
                            <button
                              onClick={() => actions.onEdit!(item)}
                              className={`${styles.actionBtn} ${styles.edit}`}
                              title="Edit"
                            >
                              ✏️
                            </button>
                          )}
                          {actions.onDelete && (
                            <button
                              onClick={() => actions.onDelete!(item)}
                              className={`${styles.actionBtn} ${styles.delete}`}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          )}
                          {actions.customActions?.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={`${styles.actionBtn} ${action.className || ''}`}
                              title={action.label}
                            >
                              {action.icon || action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} entries
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={styles.pageBtn}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`${styles.pageBtn} ${
                    pageNum === pagination.currentPage ? styles.active : ''
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={styles.pageBtn}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;