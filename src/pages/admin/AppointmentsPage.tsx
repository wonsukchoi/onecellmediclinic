import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

const AppointmentsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'patient_name',
      label: '환자명',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.patient_email}</div>
        </div>
      ),
    },
    {
      key: 'patient_phone',
      label: '전화번호',
      width: '140px',
    },
    {
      key: 'service_type',
      label: '서비스',
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
      key: 'preferred_date',
      label: '날짜',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      key: 'preferred_time',
      label: '시간',
      width: '100px',
    },
    {
      key: 'status',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (value) => {
        const colors = {
          pending: { bg: '#fef3c7', color: '#92400e' },
          confirmed: { bg: '#dcfce7', color: '#166534' },
          cancelled: { bg: '#fee2e2', color: '#991b1b' },
          completed: { bg: '#e0e7ff', color: '#3730a3' },
        };
        const style = colors[value as keyof typeof colors] || colors.pending;

        return (
          <span style={{
            background: style.bg,
            color: style.color,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {value}
          </span>
        );
      },
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
    name: '예약 관리',
    singularName: '예약',
    tableName: 'appointments',
    columns,
    searchFields: ['patient_name', 'patient_email', 'patient_phone', 'service_type'],
    defaultSort: { field: 'created_at', direction: 'desc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/appointments/new',
    editPath: '/admin/appointments/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default AppointmentsPage;