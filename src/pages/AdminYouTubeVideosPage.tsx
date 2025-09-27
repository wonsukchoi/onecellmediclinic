import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { youtubeVideosService } from '../services/features.service'

interface YouTubeVideo {
  id: number
  title: string
  youtube_id: string
  description?: string
  category?: string
  featured: boolean
  view_count: number
  order_index: number
  thumbnail_url?: string
  duration_seconds?: number
  published_at?: string
  tags?: string[]
  active: boolean
  created_at: string
}

export const AdminYouTubeVideosPage: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null)

  const categoryOptions = [
    { value: 'procedure', label: '시술 영상' },
    { value: 'testimonial', label: '후기 영상' },
    { value: 'education', label: '교육 영상' },
    { value: 'clinic_tour', label: '클리닉 투어' },
    { value: 'doctor_interview', label: '의료진 인터뷰' },
    { value: 'general', label: '일반' }
  ]

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: 'YouTube 비디오 제목을 입력하세요'
    },
    {
      key: 'youtube_id',
      label: 'YouTube ID',
      type: 'text' as const,
      required: true,
      placeholder: 'YouTube 비디오 ID (예: dQw4w9WgXcQ)'
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
      options: categoryOptions,
      placeholder: '카테고리를 선택하세요'
    },
    {
      key: 'thumbnail_url',
      label: '썸네일 URL',
      type: 'text' as const,
      placeholder: 'https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg'
    },
    {
      key: 'duration_seconds',
      label: '재생 시간 (초)',
      type: 'number' as const,
      placeholder: '비디오 재생 시간을 초 단위로 입력하세요'
    },
    {
      key: 'published_at',
      label: '게시일',
      type: 'date' as const
    },
    {
      key: 'tags',
      label: '태그 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '성형외과, 후기, 교육'
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
      type: 'checkbox' as const,
      defaultValue: false
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
      render: (value: string, row: YouTubeVideo) => (
        <div className="flex items-center">
          <img
            src={row.thumbnail_url || `https://img.youtube.com/vi/${row.youtube_id}/mqdefault.jpg`}
            alt={value}
            className="w-16 h-12 object-cover rounded mr-3"
          />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">ID: {row.youtube_id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (value: string) => {
        if (!value) return '-'
        const category = categoryOptions.find(cat => cat.value === value)
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {category?.label || value}
          </span>
        )
      }
    },
    {
      key: 'duration_seconds',
      label: '재생시간',
      render: (value: number) => {
        if (!value) return '-'
        const minutes = Math.floor(value / 60)
        const seconds = value % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      }
    },
    {
      key: 'view_count',
      label: '조회수',
      render: (value: number) => value ? value.toLocaleString() : '0'
    },
    {
      key: 'featured',
      label: '추천',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-yellow-100 text-yellow-800'
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
      key: 'youtube_id',
      label: '링크',
      render: (value: string) => (
        <a
          href={`https://www.youtube.com/watch?v=${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          YouTube에서 보기
        </a>
      )
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const data = await youtubeVideosService.getAll()
      setVideos(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching YouTube videos:', error)
      setError('YouTube 비디오를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingVideo(null)
    setIsModalOpen(true)
  }

  const handleEdit = (video: YouTubeVideo) => {
    setEditingVideo(video)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 YouTube 비디오를 삭제하시겠습니까?')) return

    try {
      await youtubeVideosService.delete(id)
      await fetchVideos()
    } catch (error) {
      console.error('Error deleting YouTube video:', error)
      alert('YouTube 비디오 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      // Process tags
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }

      // Auto-generate thumbnail URL if not provided
      if (!data.thumbnail_url && data.youtube_id) {
        data.thumbnail_url = `https://img.youtube.com/vi/${data.youtube_id}/maxresdefault.jpg`
      }

      if (editingVideo) {
        await youtubeVideosService.update(editingVideo.id, data)
      } else {
        await youtubeVideosService.create(data)
      }

      setIsModalOpen(false)
      await fetchVideos()
    } catch (error) {
      console.error('Error saving YouTube video:', error)
      alert('YouTube 비디오 저장에 실패했습니다.')
    }
  }


  const getInitialFormData = () => {
    if (!editingVideo) return {}

    return {
      ...editingVideo,
      tags: editingVideo.tags?.join(', ') || '',
      published_at: editingVideo.published_at ? editingVideo.published_at.split('T')[0] : ''
    }
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
          <h1 className="text-2xl font-bold text-gray-900">YouTube 비디오 관리</h1>
          <p className="text-gray-600">YouTube 비디오를 관리합니다</p>
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
          { label: 'Edit', onClick: (item: YouTubeVideo) => handleEdit(item) },
          { label: 'Delete', onClick: (item: YouTubeVideo) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? '비디오 수정' : '비디오 추가'}
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