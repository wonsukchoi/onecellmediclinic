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
      label: 'Image',
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
      label: 'Procedure Name',
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
      label: 'Category',
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
          {item.category?.name || `Category ${value}`}
        </span>
      ),
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      width: '100px',
      render: (value) => value ? `${value} min` : '—',
    },
    {
      key: 'price_range',
      label: 'Price Range',
      width: '120px',
      render: (value) => value || '—',
    },
    {
      key: 'active',
      label: 'Status',
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
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'display_order',
      label: 'Order',
      width: '80px',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const config = {
    name: 'Procedures',
    singularName: 'Procedure',
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