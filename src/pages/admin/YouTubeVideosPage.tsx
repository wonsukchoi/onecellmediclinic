import React, { useState } from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';
import { Icon } from '../../components/icons';

const YouTubeVideosPage: React.FC = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');

  // YouTube helper functions
  const getYouTubeThumbnail = (youtubeId: string, quality: 'default' | 'mq' | 'hq' | 'sd' | 'maxres' = 'mq') => {
    const qualityMap = {
      default: 'default',      // 120x90
      mq: 'mqdefault',         // 320x180
      hq: 'hqdefault',         // 480x360
      sd: 'sddefault',         // 640x480
      maxres: 'maxresdefault'  // 1280x720
    };
    return `https://img.youtube.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
  };

  const getYouTubeEmbedUrl = (youtubeId: string) => {
    return `https://www.youtube.com/embed/${youtubeId}`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPublishedDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openVideoModal = (youtubeId: string) => {
    setSelectedVideoId(youtubeId);
    setVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideoId('');
  };

  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'youtube_id',
      label: '썸네일',
      width: '120px',
      render: (value, item) => {
        const thumbnailUrl = item.thumbnail_url || getYouTubeThumbnail(value);
        return (
          <div style={{ position: 'relative' }}>
            <img
              src={thumbnailUrl}
              alt={item.title}
              style={{
                width: '100px',
                height: '56px',
                objectFit: 'cover',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => openVideoModal(value)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              title="동영상 보기"
            />
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0.8,
                transition: 'opacity 0.2s ease'
              }}
              onClick={() => openVideoModal(value)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              <Icon name="video" size="sm" color="white" />
            </div>
          </div>
        );
      },
    },
    {
      key: 'title',
      label: '제목',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{
            fontWeight: 600,
            marginBottom: '4px',
            cursor: 'pointer',
            color: '#1d4ed8'
          }}
          onClick={() => openVideoModal(item.youtube_id)}
          title="동영상 보기"
          >
            {value}
          </div>
          {item.description && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.description}
            </div>
          )}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '4px',
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            {item.duration_seconds && (
              <span>재생 시간: {formatDuration(item.duration_seconds)}</span>
            )}
            {item.published_at && (
              <span>게시: {formatPublishedDate(item.published_at)}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: '카테고리',
      sortable: true,
      width: '120px',
      render: (value) => {
        const categoryColors: Record<string, { bg: string; text: string }> = {
          general: { bg: '#f0fdf4', text: '#166534' },
          procedure: { bg: '#eff6ff', text: '#1d4ed8' },
          testimonial: { bg: '#fef7ff', text: '#a21caf' },
          educational: { bg: '#fffbeb', text: '#d97706' },
          promotional: { bg: '#fef2f2', text: '#dc2626' },
          consultation: { bg: '#f0f9ff', text: '#0369a1' },
        };
        const colors = categoryColors[value] || { bg: '#f3f4f6', text: '#374151' };

        const categoryLabels: Record<string, string> = {
          general: '일반',
          procedure: '시술',
          testimonial: '후기',
          educational: '교육',
          promotional: '홍보',
          consultation: '상담',
        };

        return (
          <span style={{
            background: colors.bg,
            color: colors.text,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600,
          }}>
            {categoryLabels[value] || value}
          </span>
        );
      },
    },
    {
      key: 'tags',
      label: '태그',
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
      label: '조회수',
      sortable: true,
      width: '90px',
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
      label: '주요 콘텐츠',
      sortable: true,
      width: '100px',
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
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {value && <Icon name="star" size="sm" />}
            {value ? '주요' : '일반'}
          </span>
        </span>
      ),
    },
    {
      key: 'active',
      label: '활성 상태',
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
          {value ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      key: 'order_index',
      label: '순서',
      width: '70px',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'created_at',
      label: '생성일',
      sortable: true,
      width: '100px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const config = {
    name: '유튜브 동영상',
    singularName: '유튜브 동영상',
    tableName: 'youtube_videos',
    columns,
    searchFields: ['title', 'description', 'category', 'tags'],
    defaultSort: { field: 'order_index', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/youtube-videos/new',
    editPath: '/admin/youtube-videos/:id/edit',
  };

  return (
    <>
      <GenericEntityPage config={config} />

      {/* Video Modal */}
      {videoModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeVideoModal}
        >
          <div
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '800px',
              aspectRatio: '16/9',
              backgroundColor: 'black',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
                fontSize: '18px',
                fontWeight: 'bold',
              }}
              onClick={closeVideoModal}
            >
              ×
            </button>
            <iframe
              src={getYouTubeEmbedUrl(selectedVideoId)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default YouTubeVideosPage;