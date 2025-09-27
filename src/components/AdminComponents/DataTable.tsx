import { useState } from 'react'
import type { TableColumn, SortParams } from '../../types'
import styles from './DataTable.module.css'

interface DataTableProps<T> {
  data: T[]
  columns: TableColumn[]
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    onPageChange: (page: number) => void
  }
  sorting?: {
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
    onSort: (params: SortParams) => void
  }
  onRowClick?: (item: T, index: number) => void
  emptyMessage?: string
  actions?: {
    label: string
    onClick: (item: T, index: number) => void
    variant?: 'primary' | 'secondary' | 'danger'
    icon?: string
  }[]
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  onRowClick,
  emptyMessage = '데이터가 없습니다',
  actions
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleSort = (column: TableColumn) => {
    if (!column.sortable || !sorting) return

    const newDirection = sorting.sortBy === column.key && sorting.sortDirection === 'asc' ? 'desc' : 'asc'
    sorting.onSort({ field: column.key, direction: newDirection })
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)))
    }
  }

  const getSortIcon = (column: TableColumn) => {
    if (!column.sortable || !sorting || sorting.sortBy !== column.key) {
      return '↕️'
    }
    return sorting.sortDirection === 'asc' ? '↑' : '↓'
  }

  const getActionVariantClass = (variant?: string) => {
    switch (variant) {
      case 'primary': return styles.primaryAction
      case 'danger': return styles.dangerAction
      case 'secondary':
      default: return styles.secondaryAction
    }
  }

  if (loading) {
    return (
      <div className={styles.dataTable}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dataTable}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {actions && (
                <th className={styles.checkboxColumn}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className={styles.checkbox}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${styles.tableHeader} ${column.sortable ? styles.sortable : ''}`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className={styles.headerContent}>
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className={styles.sortIcon}>
                        {getSortIcon(column)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className={styles.actionsColumn}>작업</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 0)}
                  className={styles.emptyRow}
                >
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={`${styles.tableRow} ${onRowClick ? styles.clickableRow : ''} ${selectedRows.has(index) ? styles.selectedRow : ''}`}
                  onClick={() => onRowClick?.(item, index)}
                >
                  {actions && (
                    <td className={styles.checkboxColumn}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectRow(index)
                        }}
                        className={styles.checkbox}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={styles.tableCell}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : String(item[column.key] || '-')
                      }
                    </td>
                  ))}
                  {actions && (
                    <td className={styles.actionsColumn}>
                      <div className={styles.actions}>
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item, index)
                            }}
                            className={`${styles.actionButton} ${getActionVariantClass(action.variant)}`}
                            title={action.label}
                          >
                            {action.icon && <span className={styles.actionIcon}>{action.icon}</span>}
                            <span className={styles.actionLabel}>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            {pagination.totalItems}개 중 {((pagination.currentPage - 1) * 20) + 1}-{Math.min(pagination.currentPage * 20, pagination.totalItems)}개 표시
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={styles.paginationButton}
            >
              이전
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNumber = Math.max(1, pagination.currentPage - 2) + i
              if (pageNumber > pagination.totalPages) return null

              return (
                <button
                  key={pageNumber}
                  onClick={() => pagination.onPageChange(pageNumber)}
                  className={`${styles.paginationButton} ${pageNumber === pagination.currentPage ? styles.activePage : ''}`}
                >
                  {pageNumber}
                </button>
              )
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={styles.paginationButton}
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  )
}