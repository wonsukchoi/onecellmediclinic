import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { galleryItemsService } from '../services/features.service'
import type { GalleryItem } from '../types'

export const AdminGalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      placeholder: '갤러리 항목 제목을 입력하세요'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      placeholder: '항목 설명을 입력하세요'
    },
    {
      key: 'before_image_url',
      label: '시술 전 이미지 URL',
      type: 'text' as const,
      required: true,
      placeholder: 'https://example.com/before.jpg'
    },
    {
      key: 'after_image_url',
      label: '시술 후 이미지 URL',
      type: 'text' as const,
      required: true,
      placeholder: 'https://example.com/after.jpg'
    },
    {
      key: 'additional_images',
      label: '추가 이미지 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: 'https://example.com/img1.jpg, https://example.com/img2.jpg'
    },
    {
      key: 'procedure_id',
      label: '시술 ID',
      type: 'number' as const,
      placeholder: '관련 시술 ID를 입력하세요'
    },
    {
      key: 'provider_id',
      label: '의료진 ID',
      type: 'number' as const,
      placeholder: '담당 의료진 ID를 입력하세요'
    },
    {
      key: 'patient_age_range',
      label: '환자 연령대',
      type: 'text' as const,
      placeholder: '예: 20대 후반, 30대 초반'
    },
    {
      key: 'procedure_date',
      label: '시술일',
      type: 'date' as const
    },
    {
      key: 'recovery_weeks',
      label: '회복 기간 (주)',
      type: 'number' as const,
      placeholder: '회복 기간을 주 단위로 입력하세요'
    },
    {
      key: 'patient_testimonial',
      label: '환자 후기',
      type: 'textarea' as const,
      placeholder: '환자 후기를 입력하세요'
    },
    {
      key: 'tags',
      label: '태그 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '성형외과, 코성형, 자연스러운'
    },
    {
      key: 'display_order',
      label: '정렬 순서',
      type: 'number' as const,
      defaultValue: 0
    },
    {
      key: 'consent_given',
      label: '환자 동의',
      type: 'checkbox' as const,
      defaultValue: false
    },
    {
      key: 'featured',
      label: '추천 갤러리',
      type: 'checkbox' as const,
      defaultValue: false
    }
  ]

  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (value: string, row: GalleryItem) => (
        <div className="flex items-center">
          <img
            src={row.before_image_url}
            alt="Before"
            className="w-12 h-12 object-cover rounded mr-3"
          />
          <div>
            <div className="font-medium">{value || '제목 없음'}</div>
            {row.procedure_id && (
              <div className="text-sm text-gray-500">시술 ID: {row.procedure_id}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'patient_age_range',
      label: '연령대',
      render: (value: string) => value || '-'
    },
    {
      key: 'recovery_weeks',
      label: '회복기간',
      render: (value: number) => value ? `${value}주` : '-'
    },
    {
      key: 'consent_given',
      label: '동의',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? '동의함' : '미동의'}
        </span>
      )
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
      key: 'tags',
      label: '태그',
      render: (value: string[]) => {
        if (!value || value.length === 0) return '-'
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
            {value.length > 2 && (
              <span className="text-xs text-gray-500">
                +{value.length - 2}
              </span>
            )}
          </div>
        )
      }
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      const data = await galleryItemsService.getAll()
      setGalleryItems(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      setError('갤러리 항목을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 갤러리 항목을 삭제하시겠습니까?')) return

    try {
      await galleryItemsService.delete(id)
      await fetchGalleryItems()
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      alert('갤러리 항목 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      // Process additional_images and tags
      if (data.additional_images && typeof data.additional_images === 'string') {
        data.additional_images = data.additional_images.split(',').map((url: string) => url.trim()).filter(Boolean)
      }
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }

      if (editingItem) {
        await galleryItemsService.update(editingItem.id, data)
      } else {
        await galleryItemsService.create(data)
      }

      setIsModalOpen(false)
      await fetchGalleryItems()
    } catch (error) {
      console.error('Error saving gallery item:', error)
      alert('갤러리 항목 저장에 실패했습니다.')
    }
  }


  const getInitialFormData = () => {
    if (!editingItem) return {}

    return {
      ...editingItem,
      additional_images: editingItem.additional_images?.join(', ') || '',
      tags: editingItem.tags?.join(', ') || ''
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
          onClick={fetchGalleryItems}
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
          <h1 className="text-2xl font-bold text-gray-900">갤러리 관리</h1>
          <p className="text-gray-600">시술 전후 갤러리를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          갤러리 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={galleryItems}
        actions={[
          { label: 'Edit', onClick: (item: GalleryItem) => handleEdit(item) },
          { label: 'Delete', onClick: (item: GalleryItem) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? '갤러리 수정' : '갤러리 추가'}
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