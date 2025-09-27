import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { AdminService } from '../../services/supabase';
import type { ListParams } from '../../types/admin';
import styles from './GenericEntityPage.module.css';

interface EntityConfig {
  name: string;
  singularName: string;
  tableName: string;
  columns: Column[];
  searchFields: string[];
  defaultSort: { field: string; direction: 'asc' | 'desc' };
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  createPath?: string;
  editPath?: string;
}

interface GenericEntityPageProps {
  config: EntityConfig;
}

const GenericEntityPage: React.FC<GenericEntityPageProps> = ({ config }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [sorting, setSorting] = useState({
    field: config.defaultSort.field,
    direction: config.defaultSort.direction,
  });
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ListParams = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchValue,
        sort: sorting,
      };

      const result = await AdminService.getAll(config.tableName, params);

      if (result.success && result.data) {
        setData(result.data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data!.totalPages,
          totalItems: result.data!.total,
        }));
      } else {
        setError(result.error || 'Failed to load data');
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [config.tableName, pagination.currentPage, pagination.itemsPerPage, searchValue, sorting]);

  useEffect(() => {
    // Initialize from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const sortField = searchParams.get('sort') || config.defaultSort.field;
    const sortDir = (searchParams.get('dir') || config.defaultSort.direction) as 'asc' | 'desc';

    setPagination(prev => ({ ...prev, currentPage: page }));
    setSearchValue(search);
    setSorting({ field: sortField, direction: sortDir });
  }, [searchParams, config.defaultSort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateUrlParams = useCallback((params: Partial<{
    page: number;
    search: string;
    sort: string;
    dir: string;
  }>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    updateUrlParams({ page });
  };

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSorting({ field, direction });
    updateUrlParams({ sort: field, dir: direction, page: 1 });
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams({ search: value, page: 1 });
  };

  const handleCreate = () => {
    if (config.createPath) {
      navigate(config.createPath);
    }
  };

  const handleEdit = (item: any) => {
    if (config.editPath && item.id) {
      navigate(config.editPath.replace(':id', item.id));
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm(`Are you sure you want to delete this ${config.singularName.toLowerCase()}?`)) {
      return;
    }

    try {
      const result = await AdminService.delete(config.tableName, item.id);

      if (result.success) {
        await loadData();
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        setError(result.error || 'Failed to delete item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleBulkDelete = async (items: any[]) => {
    if (!window.confirm(`Are you sure you want to delete ${items.length} ${config.name.toLowerCase()}?`)) {
      return;
    }

    try {
      const ids = items.map(item => item.id);
      const result = await AdminService.bulkDelete(config.tableName, ids);

      if (result.success) {
        await loadData();
        setSelectedItems([]);
      } else {
        setError(result.error || 'Failed to delete items');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className={styles.entityPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>{config.name}</h1>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          {config.canCreate && (
            <button
              onClick={handleCreate}
              className={styles.createButton}
            >
              + Add {config.singularName}
            </button>
          )}
          <button
            onClick={loadData}
            className={styles.refreshButton}
            disabled={loading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <DataTable
        data={data}
        columns={config.columns}
        loading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
        sorting={{
          field: sorting.field,
          direction: sorting.direction,
          onSort: handleSort,
        }}
        selection={{
          selectedItems,
          onSelectionChange: setSelectedItems,
          getItemId: (item) => item.id,
        }}
        search={{
          value: searchValue,
          placeholder: `Search ${config.name.toLowerCase()}...`,
          onSearch: handleSearch,
        }}
        actions={{
          onEdit: config.canEdit ? handleEdit : undefined,
          onDelete: config.canDelete ? handleDelete : undefined,
        }}
        bulkActions={config.canDelete ? [{
          label: 'Delete Selected',
          icon: '🗑️',
          onClick: handleBulkDelete,
          className: styles.deleteAction,
        }] : undefined}
        emptyMessage={`No ${config.name.toLowerCase()} found`}
        className={styles.dataTable}
      />
    </div>
  );
};

export default GenericEntityPage;