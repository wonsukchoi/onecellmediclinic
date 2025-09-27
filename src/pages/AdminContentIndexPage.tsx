import React from 'react'
import { Link } from 'react-router-dom'

export const AdminContentIndexPage: React.FC = () => {
  const contentTypes = [
    {
      name: 'Video Shorts',
      path: '/admin/content/video-shorts',
      icon: '🎬',
      description: 'Manage short video content'
    },
    {
      name: 'Features',
      path: '/admin/content/features',
      icon: '⭐',
      description: 'Manage clinic features and highlights'
    },
    {
      name: 'Events',
      path: '/admin/content/events',
      icon: '📅',
      description: 'Manage events and promotions'
    },
    {
      name: 'Blog',
      path: '/admin/content/blog',
      icon: '📝',
      description: 'Manage blog posts and articles'
    },
    {
      name: 'Gallery',
      path: '/admin/content/gallery',
      icon: '🖼️',
      description: 'Manage image gallery'
    },
    {
      name: 'Banners',
      path: '/admin/content/banners',
      icon: '🏷️',
      description: 'Manage promotional banners'
    },
    {
      name: 'Selfie Reviews',
      path: '/admin/content/selfie-reviews',
      icon: '🤳',
      description: 'Manage customer selfie reviews'
    },
    {
      name: 'YouTube Videos',
      path: '/admin/content/youtube-videos',
      icon: '📺',
      description: 'Manage YouTube video content'
    },
    {
      name: 'Differentiators',
      path: '/admin/content/differentiators',
      icon: '🏆',
      description: 'Manage competitive differentiators'
    }
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a1a1a', marginBottom: '0.5rem' }}>콘텐츠 관리</h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>웹사이트의 모든 콘텐츠를 관리할 수 있습니다</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {contentTypes.map((contentType) => (
          <Link
            key={contentType.path}
            to={contentType.path}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.5rem',
              background: 'white',
              border: '1px solid #e5e5e5',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{
              fontSize: '2rem',
              marginRight: '1rem',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              {contentType.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1a1a1a', margin: '0 0 0.5rem 0' }}>{contentType.name}</h3>
              <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{contentType.description}</p>
            </div>
            <div style={{ fontSize: '1.2rem', color: '#9ca3af', marginLeft: '1rem' }}>
              →
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}