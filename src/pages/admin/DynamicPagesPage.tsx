import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { CMSService } from '../../services/cms.service';
import type { DynamicPage, PageStatus } from '../../types';
import { Icon } from '../../components/icons';
import styles from './DynamicPagesPage.module.css';

const DynamicPagesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<DynamicPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<DynamicPage[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [sorting, setSorting] = useState({
    field: 'updated_at',
    direction: 'desc' as 'asc' | 'desc',
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  const columns: Column<DynamicPage>[] = [
    {
      key: 'title',
      label: '제목',
      sortable: true,
      width: '25%',
      render: (value, item) => (
        <div className={styles.titleCell}>
          <span className={styles.title}>{value}</span>
          <span className={styles.slug}>/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '10%',
      render: (value: PageStatus) => (
        <span className={`${styles.statusBadge} ${styles[value]}`}>
          {value === 'draft' && '초안'}
          {value === 'published' && '게시됨'}
          {value === 'archived' && '보관됨'}
        </span>
      ),
    },
    {
      key: 'template_id',
      label: '템플릿',
      sortable: false,
      width: '12%',
      render: (value) => {
        const template = templates.find(t => t.id === value);
        return template ? template.name : '-';
      },
    },
    {
      key: 'view_count',
      label: '조회수',
      sortable: true,
      width: '8%',
      align: 'right' as const,
      render: (value) => value?.toLocaleString() || '0',
    },
    {
      key: 'published_at',
      label: '게시일',
      sortable: true,
      width: '12%',
      render: (value) => value ? new Date(value).toLocaleDateString('ko-KR') : '-',
    },
    {
      key: 'updated_at',
      label: '수정일',
      sortable: true,
      width: '12%',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchValue,
        status: statusFilter || undefined,
        template: templateFilter || undefined,
        sort: sorting,
      };

      const result = await CMSService.getPages(params);

      if (result.success && result.data) {
        setData(result.data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data!.totalPages,
          totalItems: result.data!.total,
        }));
      } else {
        setError(result.error || '페이지 데이터 로드에 실패했습니다');
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchValue, statusFilter, templateFilter, sorting]);

  const loadTemplates = useCallback(async () => {
    try {
      const result = await CMSService.getTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, []);

  useEffect(() => {
    // Initialize from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') as PageStatus || '';
    const template = searchParams.get('template') || '';
    const sortField = searchParams.get('sort') || 'updated_at';
    const sortDir = (searchParams.get('dir') || 'desc') as 'asc' | 'desc';

    setPagination(prev => ({ ...prev, currentPage: page }));
    setSearchValue(search);
    setStatusFilter(status);
    setTemplateFilter(template);
    setSorting({ field: sortField, direction: sortDir });
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const updateUrlParams = useCallback((params: Partial<{
    page: number;
    search: string;
    status: string;
    template: string;
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

  const handleStatusFilter = (status: PageStatus | '') => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams({ status, page: 1 });
  };

  const handleTemplateFilter = (template: string) => {
    setTemplateFilter(template);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams({ template, page: 1 });
  };

  const handleCreate = () => {
    navigate('/admin/cms/pages/new');
  };

  const handleEdit = (item: DynamicPage) => {
    navigate(`/admin/cms/pages/${item.id}/edit`);
  };

  const handleView = (item: DynamicPage) => {
    // Open page in new tab
    window.open(`/${item.slug}`, '_blank');
  };

  const handleDuplicate = (item: DynamicPage) => {
    navigate(`/admin/cms/pages/new?duplicate=${item.id}`);
  };

  const handleDelete = async (item: DynamicPage) => {
    if (!window.confirm(`"${item.title}" 페이지를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const result = await CMSService.deletePage(item.id);

      if (result.success) {
        await loadData();
        setSelectedItems(prev => prev.filter(selected => selected.id !== item.id));
      } else {
        setError(result.error || '페이지 삭제에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    }
  };

  const handleBulkPublish = async (items: DynamicPage[]) => {
    if (!window.confirm(`${items.length}개의 페이지를 게시하시겠습니까?`)) {
      return;
    }

    try {
      const promises = items.map(item =>
        CMSService.updatePage(item.id, { status: 'published' })
      );

      await Promise.all(promises);
      await loadData();
      setSelectedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '페이지 게시에 실패했습니다');
    }
  };

  const handleBulkUnpublish = async (items: DynamicPage[]) => {
    if (!window.confirm(`${items.length}개의 페이지를 게시 중단하시겠습니까?`)) {
      return;
    }

    try {
      const promises = items.map(item =>
        CMSService.updatePage(item.id, { status: 'draft' })
      );

      await Promise.all(promises);
      await loadData();
      setSelectedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '페이지 게시 중단에 실패했습니다');
    }
  };

  const handleBulkDelete = async (items: DynamicPage[]) => {
    if (!window.confirm(`${items.length}개의 페이지를 정말 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const promises = items.map(item => CMSService.deletePage(item.id));
      await Promise.all(promises);
      await loadData();
      setSelectedItems([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '페이지 삭제에 실패했습니다');
    }
  };

  return (
    <div className={styles.pagesPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>동적 페이지 관리</h1>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={handleCreate}
            className={styles.createButton}
          >
            + 새 페이지 추가
          </button>
          <button
            onClick={loadData}
            className={styles.refreshButton}
            disabled={loading}
          >
            <Icon name="refresh" size="sm" />
            새로고침
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterRow}>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as PageStatus | '')}
            className={styles.filterSelect}
          >
            <option value="">모든 상태</option>
            <option value="draft">초안</option>
            <option value="published">게시됨</option>
            <option value="archived">보관됨</option>
          </select>

          <select
            value={templateFilter}
            onChange={(e) => handleTemplateFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">모든 템플릿</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={data}
        columns={columns}
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
          placeholder: "페이지 제목, 설명, 키워드 검색...",
          onSearch: handleSearch,
        }}
        actions={{
          onEdit: handleEdit,
          onDelete: handleDelete,
          onView: handleView,
          customActions: [
            {
              label: '복제',
              icon: 'copy',
              onClick: handleDuplicate,
              className: styles.duplicateAction,
            },
          ],
        }}
        bulkActions={[
          {
            label: '게시',
            icon: 'publish',
            onClick: handleBulkPublish,
            className: styles.publishAction,
          },
          {
            label: '게시 중단',
            icon: 'unpublish',
            onClick: handleBulkUnpublish,
            className: styles.unpublishAction,
          },
          {
            label: '선택 항목 삭제',
            icon: 'delete',
            onClick: handleBulkDelete,
            className: styles.deleteAction,
          },
        ]}
        emptyMessage="페이지를 찾을 수 없습니다"
        className={styles.dataTable}
      />
    </div>
  );
};

export default DynamicPagesPage;