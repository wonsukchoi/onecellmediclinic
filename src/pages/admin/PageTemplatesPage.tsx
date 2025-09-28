import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DataTable from '../../components/admin/DataTable';
import type { Column } from '../../components/admin/DataTable';
import { CMSService } from '../../services/cms.service';
import type { PageTemplate } from '../../types';
import { Icon } from '../../components/icons';
import styles from './PageTemplatesPage.module.css';

const PageTemplatesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<PageTemplate[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });
  const [sorting, setSorting] = useState({
    field: 'name',
    direction: 'asc' as 'asc' | 'desc',
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | ''>('');
  const [error, setError] = useState<string | null>(null);

  const columns: Column<PageTemplate>[] = [
    {
      key: 'name',
      label: '템플릿 이름',
      sortable: true,
      width: '25%',
      render: (value, item) => (
        <div className={styles.nameCell}>
          <span className={styles.name}>{value}</span>
          {item.description && (
            <span className={styles.description}>{item.description}</span>
          )}
        </div>
      ),
    },
    {
      key: 'is_active',
      label: '상태',
      sortable: true,
      width: '10%',
      align: 'center' as const,
      render: (value: boolean) => (
        <span className={`${styles.statusBadge} ${value ? styles.active : styles.inactive}`}>
          {value ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'available_blocks',
      label: '사용 가능한 블록',
      sortable: false,
      width: '30%',
      render: (value: string[]) => (
        <div className={styles.blocksCell}>
          {value && value.length > 0 ? (
            <div className={styles.blocksList}>
              {value.slice(0, 3).map(block => (
                <span key={block} className={styles.blockTag}>
                  {getBlockTypeLabel(block)}
                </span>
              ))}
              {value.length > 3 && (
                <span className={styles.moreBlocks}>
                  +{value.length - 3}개 더
                </span>
              )}
            </div>
          ) : (
            <span className={styles.noBlocks}>제한 없음</span>
          )}
        </div>
      ),
    },
    {
      key: 'css_classes',
      label: 'CSS 클래스',
      sortable: false,
      width: '15%',
      render: (value) => value ? (
        <code className={styles.cssClasses}>{value}</code>
      ) : '-',
    },
    {
      key: 'created_at',
      label: '생성일',
      sortable: true,
      width: '12%',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const getBlockTypeLabel = (blockType: string): string => {
    const labels: Record<string, string> = {
      text: '텍스트',
      image: '이미지',
      video: '비디오',
      gallery: '갤러리',
      cta: 'CTA',
      spacer: '여백',
      html: 'HTML',
    };
    return labels[blockType] || blockType;
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchValue,
        is_active: statusFilter === '' ? undefined : statusFilter,
      };

      const result = await CMSService.getAllTemplates(params);

      if (result.success && result.data) {
        setData(result.data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data!.totalPages,
          totalItems: result.data!.total,
        }));
      } else {
        setError(result.error || '템플릿 데이터 로드에 실패했습니다');
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchValue, statusFilter]);

  useEffect(() => {
    // Initialize from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const sortField = searchParams.get('sort') || 'name';
    const sortDir = (searchParams.get('dir') || 'asc') as 'asc' | 'desc';

    setPagination(prev => ({ ...prev, currentPage: page }));
    setSearchValue(search);
    setStatusFilter(status === 'true' ? true : status === 'false' ? false : '');
    setSorting({ field: sortField, direction: sortDir });
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateUrlParams = useCallback((params: Partial<{
    page: number;
    search: string;
    status: string;
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

  const handleStatusFilter = (status: boolean | '') => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    updateUrlParams({
      status: status === '' ? '' : status.toString(),
      page: 1
    });
  };

  const handlePreview = (item: PageTemplate) => {
    // Show template preview in modal or new window
    console.log('Preview template:', item);
    alert('템플릿 미리보기 기능은 추후 구현 예정입니다.');
  };

  const handleToggleActive = async (item: PageTemplate) => {
    // This would require a specific endpoint to update template status
    console.log('Toggle active status for template:', item);
    alert('템플릿 활성화/비활성화 기능은 추후 구현 예정입니다.');
  };

  const handleBulkActivate = async (items: PageTemplate[]) => {
    if (!window.confirm(`${items.length}개의 템플릿을 활성화하시겠습니까?`)) {
      return;
    }

    console.log('Bulk activate templates:', items);
    alert('일괄 활성화 기능은 추후 구현 예정입니다.');
  };

  const handleBulkDeactivate = async (items: PageTemplate[]) => {
    if (!window.confirm(`${items.length}개의 템플릿을 비활성화하시겠습니까?`)) {
      return;
    }

    console.log('Bulk deactivate templates:', items);
    alert('일괄 비활성화 기능은 추후 구현 예정입니다.');
  };

  return (
    <div className={styles.templatesPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>페이지 템플릿 관리</h1>
          <p className={styles.pageDescription}>
            동적 페이지에서 사용할 수 있는 템플릿을 관리합니다.
          </p>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => alert('템플릿 생성 기능은 추후 구현 예정입니다.')}
            className={styles.createButton}
          >
            <Icon name="plus" size="sm" />
            새 템플릿 추가
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
            value={statusFilter === '' ? '' : statusFilter.toString()}
            onChange={(e) => handleStatusFilter(
              e.target.value === '' ? '' : e.target.value === 'true'
            )}
            className={styles.filterSelect}
          >
            <option value="">모든 상태</option>
            <option value="true">활성</option>
            <option value="false">비활성</option>
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
          placeholder: "템플릿 이름, 설명 검색...",
          onSearch: handleSearch,
        }}
        actions={{
          onView: handlePreview,
          customActions: [
            {
              label: '활성 상태 토글',
              icon: 'toggle',
              onClick: handleToggleActive,
              className: styles.toggleAction,
            },
          ],
        }}
        bulkActions={[
          {
            label: '활성화',
            icon: 'check',
            onClick: handleBulkActivate,
            className: styles.activateAction,
          },
          {
            label: '비활성화',
            icon: 'x',
            onClick: handleBulkDeactivate,
            className: styles.deactivateAction,
          },
        ]}
        emptyMessage="템플릿을 찾을 수 없습니다"
        className={styles.dataTable}
      />

      <div className={styles.info}>
        <div className={styles.infoBox}>
          <Icon name="warning" size="sm" />
          <div>
            <h4>템플릿 관리 안내</h4>
            <ul>
              <li>템플릿은 동적 페이지의 레이아웃과 사용 가능한 블록 타입을 정의합니다.</li>
              <li>활성 상태인 템플릿만 페이지 생성 시 선택할 수 있습니다.</li>
              <li>사용 가능한 블록이 지정되지 않은 템플릿은 모든 블록 타입을 사용할 수 있습니다.</li>
              <li>템플릿 수정은 기존 페이지에 영향을 줄 수 있으니 신중히 진행하세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageTemplatesPage;