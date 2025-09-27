import React from 'react';
import GenericEntityPage from './GenericEntityPage';
import type { Column } from '../../components/admin/DataTable';

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
      label: 'Image',
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
          📝
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
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
      label: 'Slug',
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
      label: 'Status',
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
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'author_id',
      label: 'Author',
      width: '120px',
      render: (value) => value || 'System',
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'updated_at',
      label: 'Updated',
      sortable: true,
      width: '120px',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const config = {
    name: 'Blog Posts',
    singularName: 'Blog Post',
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