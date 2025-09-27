import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

const ContactSubmissionsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'name',
      label: '연락처',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {item.email}
          </div>
          {item.phone && (
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {item.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'service_type',
      label: '관심 서비스',
      sortable: true,
      render: (value) => (
        <span style={{
          background: '#eff6ff',
          color: '#1e40af',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'message',
      label: '메시지',
      width: '300px',
      render: (value) => (
        <div style={{
          maxWidth: '300px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </div>
      ),
    },
    {
      key: 'preferred_contact',
      label: '선호 연락 방법',
      width: '130px',
      render: (value) => {
        const colors = {
          email: { bg: '#eff6ff', color: '#1e40af' },
          phone: { bg: '#f0fdf4', color: '#166534' },
        };
        const style = colors[value as keyof typeof colors] || colors.email;

        return (
          <span style={{
            background: style.bg,
            color: style.color,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      label: '접수일',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const config = {
    name: '문의 접수',
    singularName: '문의',
    tableName: 'contact_submissions',
    columns,
    searchFields: ['name', 'email', 'phone', 'service_type', 'message'],
    defaultSort: { field: 'created_at', direction: 'desc' as const },
    canCreate: false,
    canEdit: false,
    canDelete: true,
  };

  return <GenericEntityPage config={config} />;
};

export default ContactSubmissionsPage;