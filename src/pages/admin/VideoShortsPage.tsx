import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

const VideoShortsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'thumbnail_url',
      label: 'Thumbnail',
      width: '100px',
      render: (value, item) => value ? (
        <img
          src={value}
          alt={item.title}
          style={{
            width: '70px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          onClick={() => window.open(item.video_url, '_blank')}
          title="Click to view video"
        />
      ) : (
        <div style={{
          width: '70px',
          height: '40px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          cursor: 'pointer',
        }}
        onClick={() => window.open(item.video_url, '_blank')}
        title="Click to view video"
        >
          🎬
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{
            fontWeight: 600,
            marginBottom: '4px',
            cursor: 'pointer',
            color: '#1d4ed8'
          }}
          onClick={() => window.open(item.video_url, '_blank')}
          title="Click to view video"
          >
            {value}
          </div>
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
          {item.duration_seconds && (
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              marginTop: '2px'
            }}>
              Duration: {Math.floor(item.duration_seconds / 60)}:{String(item.duration_seconds % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      width: '120px',
      render: (value) => {
        const categoryColors: Record<string, { bg: string; text: string }> = {
          general: { bg: '#f0fdf4', text: '#166534' },
          procedure: { bg: '#eff6ff', text: '#1d4ed8' },
          testimonial: { bg: '#fef7ff', text: '#a21caf' },
          educational: { bg: '#fffbeb', text: '#d97706' },
          promotional: { bg: '#fef2f2', text: '#dc2626' },
        };
        const colors = categoryColors[value] || { bg: '#f3f4f6', text: '#374151' };

        return (
          <span style={{
            background: colors.bg,
            color: colors.text,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'tags',
      label: 'Tags',
      width: '150px',
      render: (value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return '—';
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
            {value.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                style={{
                  background: '#e5e7eb',
                  color: '#374151',
                  padding: '1px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
            {value.length > 2 && (
              <span style={{
                color: '#6b7280',
                fontSize: '10px',
                padding: '1px 4px',
              }}>
                +{value.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'view_count',
      label: 'Views',
      sortable: true,
      width: '80px',
      align: 'center' as const,
      render: (value) => (
        <span style={{
          background: '#f9fafb',
          color: '#374151',
          padding: '2px 6px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
        }}>
          {value?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      sortable: true,
      width: '90px',
      align: 'center' as const,
      render: (value) => (
        <span style={{
          background: value ? '#fef3c7' : '#f3f4f6',
          color: value ? '#d97706' : '#6b7280',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {value ? '⭐ Featured' : 'Normal'}
        </span>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: true,
      width: '90px',
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
      key: 'order_index',
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
    name: 'Video Shorts',
    singularName: 'Video Short',
    tableName: 'video_shorts',
    columns,
    searchFields: ['title', 'description', 'category', 'tags'],
    defaultSort: { field: 'order_index', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/video-shorts/new',
    editPath: '/admin/video-shorts/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default VideoShortsPage;