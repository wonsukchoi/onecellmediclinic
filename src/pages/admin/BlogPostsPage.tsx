import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';
import { Icon } from '../../components/icons';

const BlogPostsPage: React.FC = () => {
  const columns: Column[] = [
    {
      key: 'id',
      label: 'ID',
      width: '80px',
      sortable: true,
    },
    {
      key: 'featured_image',
      label: '이미지',
      width: '80px',
      render: (value) => value ? (
        <img
          src={value}
          alt="Blog post"
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
          <Icon name="blog" size="md" />
        </div>
      ),
    },
    {
      key: 'title',
      label: '제목',
      sortable: true,
      render: (value, item) => (
        <div>
          <div style={{ fontWeight: 600 }}>{value}</div>
          {item.excerpt && (
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              maxWidth: '300px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.excerpt}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'URL 슬러그',
      width: '150px',
      render: (value) => (
        <code style={{
          fontSize: '11px',
          background: '#f3f4f6',
          padding: '2px 4px',
          borderRadius: '4px',
          color: '#374151',
        }}>
          {value}
        </code>
      ),
    },
    {
      key: 'published',
      label: '상태',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span style={{
          background: value ? '#dcfce7' : '#fef3c7',
          color: value ? '#166534' : '#92400e',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          {value ? '게시됨' : '초안'}
        </span>
      ),
    },
    {
      key: 'author_id',
      label: '작성자',
      width: '120px',
      render: (value) => value || '시스템',
    },
    {
      key: 'created_at',
      label: '작성일',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
    {
      key: 'updated_at',
      label: '수정일',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString('ko-KR'),
    },
  ];

  const config = {
    name: '블로그 게시물',
    singularName: '블로그 글',
    tableName: 'blog_posts',
    columns,
    searchFields: ['title', 'excerpt', 'content', 'slug'],
    defaultSort: { field: 'updated_at', direction: 'desc' as const },
    canCreate: true,
    canEdit: true,
    canDelete: true,
    createPath: '/admin/blog-posts/new',
    editPath: '/admin/blog-posts/:id/edit',
  };

  return <GenericEntityPage config={config} />;
};

export default BlogPostsPage;