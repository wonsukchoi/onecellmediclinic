import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { videoShortsService } from '../services/features.service'

interface VideoShort {
  id: number
  title: string
  video_url: string
  thumbnail_url?: string
  description?: string
  view_count: number
  category: string
  featured: boolean
  order_index: number
  duration_seconds?: number
  tags?: string[]
  active: boolean
  created_at: string
}

export const AdminVideoShortsPage: React.FC = () => {
  const [videos, setVideos] = useState<VideoShort[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<VideoShort | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const categories = [
    { value: 'introduction', label: '소개' },
    { value: 'safety', label: '안전' },
    { value: 'recovery', label: '회복' },
    { value: 'testimonial', label: '후기' },
    { value: 'procedure', label: '시술' },
    { value: 'general', label: '일반' }
  ]

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '비디오 제목을 입력하세요'
    },
    {
      key: 'video_url',
      label: '비디오 URL',
      type: 'text' as const,
      required: true,
      placeholder: 'https://example.com/video.mp4'
    },
    {
      key: 'thumbnail_url',
      label: '썸네일 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/thumbnail.jpg'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      placeholder: '비디오 설명을 입력하세요'
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'select' as const,
      options: categories,
      required: true
    },
    {
      key: 'duration_seconds',
      label: '재생 시간 (초)',
      type: 'number' as const,
      placeholder: '60'
    },
    {
      key: 'tags',
      label: '태그 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '태그1, 태그2, 태그3'
    },
    {
      key: 'order_index',
      label: '정렬 순서',
      type: 'number' as const,
      defaultValue: 0
    },
    {
      key: 'featured',
      label: '추천 영상',
      type: 'checkbox' as const
    },
    {
      key: 'active',
      label: '활성화',
      type: 'checkbox' as const,
      defaultValue: true
    }
  ]

  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (value: string, row: VideoShort) => (
        <div>
          <div className="font-medium">{value}</div>
          {row.description && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {categories.find(c => c.value === value)?.label || value}
        </span>
      )
    },
    {
      key: 'view_count',
      label: '조회수',
      render: (value: number) => value.toLocaleString()
    },
    {
      key: 'featured',
      label: '추천',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '추천' : '일반'}
        </span>
      )
    },
    {
      key: 'active',
      label: '상태',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? '활성' : '비활성'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: '생성일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const data = await videoShortsService.getAll()
      setVideos(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('비디오를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingVideo(null)
    setFormData({})
    setIsModalOpen(true)
  }

  const handleEdit = (video: VideoShort) => {
    setEditingVideo(video)
    setFormData({
      ...video,
      tags: video.tags?.join(', ') || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 비디오를 삭제하시겠습니까?')) return

    try {
      await videoShortsService.delete(id)
      await fetchVideos()
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('비디오 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = { ...formData }
      // Process tags
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }

      if (editingVideo) {
        await videoShortsService.update(editingVideo.id, data)
      } else {
        await videoShortsService.create(data)
      }

      setIsModalOpen(false)
      setFormData({})
      await fetchVideos()
    } catch (error) {
      console.error('Error saving video:', error)
      alert('비디오 저장에 실패했습니다.')
    }
  }


  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
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
          onClick={fetchVideos}
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
          <h1 className="text-2xl font-bold text-gray-900">비디오 쇼츠 관리</h1>
          <p className="text-gray-600">비디오 쇼츠를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          비디오 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={videos}
        actions={[
          { label: 'Edit', onClick: (item: VideoShort) => handleEdit(item) },
          { label: 'Delete', onClick: (item: VideoShort) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? '비디오 수정' : '비디오 추가'}
      >
        <FormBuilder
          fields={formFields}
          values={formData}
          errors={{}}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  )
}