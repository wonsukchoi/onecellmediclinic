import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';
import { Icon } from '../../components/icons';

const ConsultationsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'patient_name',
      label: 'Patient',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {item.patient_email}
            {item.patient_age && ` • Age: ${item.patient_age}`}
          </div>
        </div>
      ),
    },
    {
      key: 'consultation_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span style={{
          background: '#f0fdf4',
          color: '#166534',
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
      key: 'procedure_interest',
      label: 'Interest',
      width: '150px',
      render: (value) => value || '—',
    },
    {
      key: 'urgency_level',
      label: 'Urgency',
      width: '100px',
      render: (value) => {
        const colors = {
          low: { bg: '#f0f9ff', color: '#0369a1' },
          medium: { bg: '#fef3c7', color: '#92400e' },
          high: { bg: '#fee2e2', color: '#991b1b' },
          urgent: { bg: '#fdf2f8', color: '#be185d' },
        };
        const style = colors[value as keyof typeof colors] || colors.medium;

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
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '100px',
      render: (value) => {
        const colors = {
          new: { bg: '#eff6ff', color: '#1e40af' },
          reviewed: { bg: '#fef3c7', color: '#92400e' },
          responded: { bg: '#dcfce7', color: '#166534' },
          closed: { bg: '#f3f4f6', color: '#4b5563' },
        };
        const style = colors[value as keyof typeof colors] || colors.new;

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
      key: 'follow_up_required',
      label: 'Follow-up',
      width: '100px',
      align: 'center' as const,
      render: (value) => value ? <Icon name="check" size="sm" /> : '—',
    },
    {
      key: 'created_at',
      label: 'Submitted',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const config = {
    name: 'Consultation Requests',
    singularName: 'Consultation',
    tableName: 'consultation_requests',
    columns,
    searchFields: ['patient_name', 'patient_email', 'consultation_type', 'procedure_interest'],
    defaultSort: { field: 'created_at', direction: 'desc' as const },
    canCreate: false,
    canEdit: true,
    canDelete: true,
    editPath: '/admin/consultations/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default ConsultationsPage;