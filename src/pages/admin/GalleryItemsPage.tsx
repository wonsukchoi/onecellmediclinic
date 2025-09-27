import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';
import { Icon } from '../../components/icons';

const GalleryItemsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'before_image_url',
      label: 'Before',
      width: '80px',
      render: (value) => value ? (
        <img
          src={value}
          alt="Before"
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
          fontSize: '12px',
          color: '#6b7280',
        }}>
          No Image
        </div>
      ),
    },
    {
      key: 'after_image_url',
      label: 'After',
      width: '80px',
      render: (value) => value ? (
        <img
          src={value}
          alt="After"
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
          fontSize: '12px',
          color: '#6b7280',
        }}>
          No Image
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value || 'Untitled'}</div>
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
      key: 'procedure_id',
      label: 'Procedure',
      width: '150px',
      render: (value, item) => value ? (
        <span style={{
          background: '#eff6ff',
          color: '#1e40af',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {item.procedure?.name || `Procedure ${value}`}
        </span>
      ) : '—',
    },
    {
      key: 'patient_age_range',
      label: 'Age Range',
      width: '100px',
      render: (value) => value || '—',
    },
    {
      key: 'featured',
      label: 'Featured',
      width: '80px',
      align: 'center' as const,
      render: (value) => value ? <Icon name="star" size="sm" /> : '—',
    },
    {
      key: 'consent_given',
      label: 'Consent',
      width: '80px',
      align: 'center' as const,
      render: (value) => (
        <span style={{
          background: value ? '#dcfce7' : '#fee2e2',
          color: value ? '#166534' : '#991b1b',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
        }}>
          {value ? 'Yes' : 'No'}
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
    name: 'Gallery Items',
    singularName: 'Gallery Item',
    tableName: 'gallery_items',
    columns,
    searchFields: ['title', 'description', 'patient_age_range', 'tags'],
    defaultSort: { field: 'display_order', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/gallery-items/new',
    editPath: '/admin/gallery-items/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default GalleryItemsPage;