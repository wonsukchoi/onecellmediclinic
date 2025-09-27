import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { clinicFeaturesService } from '../services/features.service'

interface ClinicFeature {
  id: number
  title: string
  description?: string
  icon_url?: string
  image_url?: string
  order_index: number
  category: string
  stats_number?: string
  stats_label?: string
  active: boolean
  created_at: string
}

export const AdminFeaturesPage: React.FC = () => {
  const [features, setFeatures] = useState<ClinicFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<ClinicFeature | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const categories = [
    { value: 'technology', label: '첨단기술' },
    { value: 'expertise', label: '전문성' },
    { value: 'safety', label: '안전' },
    { value: 'consultation', label: '상담' },
    { value: 'facility', label: '시설' },
    { value: 'general', label: '일반' }
  ]

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '특징 제목을 입력하세요'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      placeholder: '특징에 대한 자세한 설명을 입력하세요'
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'select' as const,
      options: categories,
      required: true
    },
    {
      key: 'icon_url',
      label: '아이콘 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/icon.svg'
    },
    {
      key: 'image_url',
      label: '이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/image.jpg'
    },
    {
      key: 'stats_number',
      label: '통계 숫자',
      type: 'text' as const,
      placeholder: '100%, 15+, 24/7 등'
    },
    {
      key: 'stats_label',
      label: '통계 라벨',
      type: 'text' as const,
      placeholder: '만족도, 년 경력, 관리 등'
    },
    {
      key: 'order_index',
      label: '정렬 순서',
      type: 'number' as const,
      defaultValue: 0
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
      render: (value: string, row: ClinicFeature) => (
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
      key: 'stats_number',
      label: '통계',
      render: (value: string, row: ClinicFeature) => {
        if (!value && !row.stats_label) return '-'
        return (
          <div className="text-sm">
            {value && <div className="font-bold text-pink-600">{value}</div>}
            {row.stats_label && <div className="text-gray-500">{row.stats_label}</div>}
          </div>
        )
      }
    },
    {
      key: 'order_index',
      label: '순서',
      render: (value: number) => value
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
    fetchFeatures()
  }, [])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const data = await clinicFeaturesService.getAll()
      setFeatures(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching features:', error)
      setError('특징을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingFeature(null)
    setFormData({})
    setIsModalOpen(true)
  }

  const handleEdit = (feature: ClinicFeature) => {
    setEditingFeature(feature)
    setFormData(feature)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 특징을 삭제하시겠습니까?')) return

    try {
      await clinicFeaturesService.delete(id)
      await fetchFeatures()
    } catch (error) {
      console.error('Error deleting feature:', error)
      alert('특징 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingFeature) {
        await clinicFeaturesService.update(editingFeature.id, formData)
      } else {
        await clinicFeaturesService.create(formData)
      }

      setIsModalOpen(false)
      setFormData({})
      await fetchFeatures()
    } catch (error) {
      console.error('Error saving feature:', error)
      alert('특징 저장에 실패했습니다.')
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
          onClick={fetchFeatures}
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
          <h1 className="text-2xl font-bold text-gray-900">클리닉 특징 관리</h1>
          <p className="text-gray-600">클리닉의 차별화된 특징을 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          특징 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={features}
        actions={[
          { label: 'Edit', onClick: (item: ClinicFeature) => handleEdit(item) },
          { label: 'Delete', onClick: (item: ClinicFeature) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeature ? '특징 수정' : '특징 추가'}
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