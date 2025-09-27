import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

const ProvidersPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'profile_image_url',
      label: 'Photo',
      width: '80px',
      render: (value, item) => value ? (
        <img
          src={value}
          alt={item.full_name}
          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          👨‍⚕️
        </div>
      ),
    },
    {
      key: 'full_name',
      label: 'Provider',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          {item.title && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {item.title}
            </div>
          )}
          {item.specialization && (
            <div style={{ fontSize: '12px', color: '#3b82f6' }}>
              {item.specialization}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'years_experience',
      label: 'Experience',
      width: '100px',
      render: (value) => value ? `${value} years` : '—',
    },
    {
      key: 'consultation_fee',
      label: 'Fee',
      width: '100px',
      render: (value) => value ? `$${value}` : '—',
    },
    {
      key: 'languages',
      label: 'Languages',
      width: '150px',
      render: (value) => {
        if (!value || !Array.isArray(value)) return '—';
        return value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '');
      },
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
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const config = {
    name: 'Medical Providers',
    singularName: 'Provider',
    tableName: 'providers',
    columns,
    searchFields: ['full_name', 'title', 'specialization', 'languages'],
    defaultSort: { field: 'full_name', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/providers/new',
    editPath: '/admin/providers/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default ProvidersPage;