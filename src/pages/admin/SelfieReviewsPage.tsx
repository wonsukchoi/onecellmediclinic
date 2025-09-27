import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';
import { Icon } from '../../components/icons';

const SelfieReviewsPage: React.FC = () => {
  // Helper function to render rating with stars
  const renderRating = (rating?: number) => {
    if (!rating) return '—';
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name="star"
            size="sm"
            color={i < rating ? '#fbbf24' : '#e5e7eb'}
          />
        ))}
        <span style={{ marginLeft: '4px', fontSize: '12px' }}>
          ({rating})
        </span>
      </span>
    );
  };

  // Helper function to get moderation status style
  const getModerationStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fef3c7', text: '#92400e', label: '대기중' },
      approved: { bg: '#dcfce7', text: '#166534', label: '승인됨' },
      rejected: { bg: '#fee2e2', text: '#991b1b', label: '거부됨' }
    };
    return styles[status] || styles.pending;
  };

  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'selfie_url',
      label: '셀피 사진',
      width: '100px',
      render: (value, item) => value ? (
        <img
          src={value}
          alt={`${item.patient_initial || item.patient_name} 셀피`}
          style={{
            width: '70px',
            height: '70px',
            objectFit: 'cover',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={() => window.open(value, '_blank')}
          title="클릭하여 이미지 보기"
        />
      ) : (
        <div style={{
          width: '70px',
          height: '70px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
        }}>
          <Icon name="selfie" size="md" />
        </div>
      ),
    },
    {
      key: 'patient_info',
      label: '환자 정보',
      sortable: false,
      render: (_, item) => (
        <div>
          <div style={{
            fontWeight: 600,
            marginBottom: '4px',
            fontSize: '14px'
          }}>
            {item.patient_initial || '이니셜 없음'}
          </div>
          {item.patient_age_range && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '2px'
            }}>
              연령대: {item.patient_age_range}
            </div>
          )}
          {item.procedure_type && (
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              background: '#f3f4f6',
              padding: '1px 6px',
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              {item.procedure_type}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'review_text',
      label: '리뷰 내용',
      render: (value) => {
        if (!value) return '—';
        return (
          <div style={{
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '13px'
          }}>
            {value}
          </div>
        );
      },
    },
    {
      key: 'rating',
      label: '평점',
      width: '120px',
      align: 'center' as const,
      sortable: true,
      render: renderRating,
    },
    {
      key: 'moderation_status',
      label: '승인 상태',
      sortable: true,
      width: '100px',
      render: (value) => {
        const status = getModerationStatusStyle(value);
        return (
          <span style={{
            background: status.bg,
            color: status.text,
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {status.label}
          </span>
        );
      },
    },
    {
      key: 'verified',
      label: '인증',
      sortable: true,
      width: '80px',
      align: 'center' as const,
      render: (value) => (
        <span style={{
          background: value ? '#dcfce7' : '#f3f4f6',
          color: value ? '#166534' : '#6b7280',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {value && <Icon name="check" size="sm" />}
          {value ? '인증됨' : '미인증'}
        </span>
      ),
    },
    {
      key: 'featured',
      label: '주요 리뷰',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {value && <Icon name="star" size="sm" />}
          {value ? '주요' : '일반'}
        </span>
      ),
    },
    {
      key: 'consent_given',
      label: '동의',
      sortable: true,
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px'
        }}>
          {value ? <Icon name="check" size="sm" /> : <Icon name="close" size="sm" />}
          {value ? '완료' : '미완료'}
        </span>
      ),
    },
    {
      key: 'treatment_details',
      label: '치료 정보',
      width: '120px',
      render: (_, item) => (
        <div style={{ fontSize: '12px' }}>
          {item.treatment_date && (
            <div style={{ color: '#6b7280', marginBottom: '2px' }}>
              치료일: {new Date(item.treatment_date).toLocaleDateString()}
            </div>
          )}
          {item.recovery_weeks && (
            <div style={{ color: '#9ca3af' }}>
              회복: {item.recovery_weeks}주
            </div>
          )}
        </div>
      ),
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
      key: 'display_order',
      label: '순서',
      width: '80px',
      align: 'center' as const,
      sortable: true,
    },
    {
      key: 'created_at',
      label: '생성일',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const config = {
    name: '셀피 리뷰',
    singularName: '셀피 리뷰',
    tableName: 'selfie_reviews',
    columns,
    searchFields: ['patient_name', 'patient_initial', 'procedure_type', 'review_text', 'tags'],
    defaultSort: { field: 'display_order', direction: 'asc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/selfie-reviews/new',
    editPath: '/admin/selfie-reviews/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default SelfieReviewsPage;