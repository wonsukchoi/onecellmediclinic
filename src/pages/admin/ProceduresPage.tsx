import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

const ProceduresPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'featured_image_url',
      label: '이미지',
      width: '80px',
      render: (value) => value ? (
        <img
          src={value}
          alt="Procedure"
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
        />
      ) : (
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          🏥
        </div>
      ),
    },
    {
      key: 'name',
      label: '시술명',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          {item.description && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category_id',
      label: '카테고리',
      sortable: true,
      width: '150px',
      render: (value, item) => (
        <span style={{
          background: '#f0fdf4',
          color: '#166534',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {item.category?.name || `카테고리 ${value}`}
        </span>
      ),
    },
    {
      key: 'duration_minutes',
      label: '소요 시간',
      width: '100px',
      render: (value) => value ? `${value}분` : '—',
    },
    {
      key: 'price_range',
      label: '가격대',
      width: '120px',
      render: (value) => value || '—',
    },
    {
      key: 'active',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span style={{
          background: value ? '#dcfce7' : '#fee2e2',
          color: value ? '#166534' : '#991b1b',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {value ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'display_order',
      label: '순서',
      width: '80px',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'created_at',
      label: '등록일',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const config = {
    name: '시술 관리',
    singularName: '시술',
    tableName: 'procedures',
    columns,
    searchFields: ['name', 'description', 'tags'],
    defaultSort: { field: 'display_order', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/procedures/new',
    editPath: '/admin/procedures/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default ProceduresPage;