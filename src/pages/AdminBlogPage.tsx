import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { blogPostsService } from '../services/features.service'
import type { BlogPost } from '../types'

export const AdminBlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '블로그 포스트 제목을 입력하세요'
    },
    {
      key: 'slug',
      label: 'URL 슬러그',
      type: 'text' as const,
      required: true,
      placeholder: 'blog-post-url-slug'
    },
    {
      key: 'excerpt',
      label: '요약',
      type: 'textarea' as const,
      placeholder: '포스트 요약을 입력하세요'
    },
    {
      key: 'content',
      label: '내용',
      type: 'textarea' as const,
      required: true,
      placeholder: '블로그 포스트 내용을 입력하세요'
    },
    {
      key: 'featured_image',
      label: '대표 이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/featured-image.jpg'
    },
    {
      key: 'published',
      label: '발행',
      type: 'checkbox' as const,
      defaultValue: false
    }
  ]

  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (value: string, row: BlogPost) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.excerpt && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.excerpt}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'slug',
      label: 'URL',
      render: (value: string) => (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </code>
      )
    },
    {
      key: 'published',
      label: '상태',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? '발행됨' : '초안'}
        </span>
      )
    },
    {
      key: 'featured_image',
      label: '대표 이미지',
      render: (value: string) => value ? (
        <img
          src={value}
          alt="Featured"
          className="w-16 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">없음</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: '생성일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    },
    {
      key: 'updated_at',
      label: '수정일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await blogPostsService.getAll()
      setPosts(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setError('블로그 포스트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingPost(null)
    setIsModalOpen(true)
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 블로그 포스트를 삭제하시겠습니까?')) return

    try {
      await blogPostsService.delete(id)
      await fetchPosts()
    } catch (error) {
      console.error('Error deleting blog post:', error)
      alert('블로그 포스트 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      // Generate slug from title if not provided
      if (!data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^a-z0-9가-힣]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      }

      if (editingPost) {
        await blogPostsService.update(editingPost.id, data)
      } else {
        await blogPostsService.create(data)
      }

      setIsModalOpen(false)
      await fetchPosts()
    } catch (error) {
      console.error('Error saving blog post:', error)
      alert('블로그 포스트 저장에 실패했습니다.')
    }
  }

  const getInitialFormData = () => {
    if (!editingPost) return {}
    return editingPost
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">블로그 관리</h1>
          <p className="text-gray-600">블로그 포스트를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          포스트 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={posts}
        actions={[
          { label: 'Edit', onClick: (post: BlogPost) => handleEdit(post) },
          { label: 'Delete', onClick: (post: BlogPost) => handleDelete(post.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPost ? '포스트 수정' : '포스트 추가'}
      >
        <FormBuilder
          fields={formFields}
          values={getInitialFormData()}
          errors={{}}
          onChange={() => {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  )
}