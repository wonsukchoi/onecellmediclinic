import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { eventBannersService } from '../services/features.service'
import type { EventBanner } from '../types'

export const AdminBannersPage: React.FC = () => {
  const [banners, setBanners] = useState<EventBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<EventBanner | null>(null)
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '배너 제목을 입력하세요'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      required: true,
      placeholder: '배너 설명을 입력하세요'
    },
    {
      key: 'image_url',
      label: '이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/banner-image.jpg'
    },
    {
      key: 'link_url',
      label: '링크 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/landing-page'
    },
    {
      key: 'start_date',
      label: '시작일',
      type: 'date' as const,
      required: true
    },
    {
      key: 'end_date',
      label: '종료일',
      type: 'date' as const,
      required: true
    },
    {
      key: 'priority',
      label: '우선순위',
      type: 'number' as const,
      placeholder: '숫자가 높을수록 우선 표시됩니다'
    },
    {
      key: 'active',
      label: '활성화',
      type: 'checkbox' as const
    }
  ]

  const columns = [
    {
      key: 'title',
      label: '제목',
      render: (value: string, row: EventBanner) => (
        <div className="flex items-center">
          {row.image_url && (
            <img
              src={row.image_url}
              alt={value}
              className="w-16 h-12 object-cover rounded mr-3"
            />
          )}
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.description}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'priority',
      label: '우선순위',
      render: (value: number) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'start_date',
      label: '시작일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    },
    {
      key: 'end_date',
      label: '종료일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    },
    {
      key: 'active',
      label: '상태',
      render: (value: boolean, row: EventBanner) => {
        const now = new Date()
        const startDate = new Date(row.start_date)
        const endDate = new Date(row.end_date)
        // const isActive = value && now >= startDate && now <= endDate

        let status = '비활성'
        let colorClass = 'bg-red-100 text-red-800'

        if (!value) {
          status = '비활성'
          colorClass = 'bg-gray-100 text-gray-800'
        } else if (now < startDate) {
          status = '예정'
          colorClass = 'bg-yellow-100 text-yellow-800'
        } else if (now > endDate) {
          status = '만료'
          colorClass = 'bg-red-100 text-red-800'
        } else {
          status = '활성'
          colorClass = 'bg-green-100 text-green-800'
        }

        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
            {status}
          </span>
        )
      }
    },
    {
      key: 'link_url',
      label: '링크',
      render: (value: string) => value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          링크 열기
        </a>
      ) : '-'
    },
    {
      key: 'created_at',
      label: '생성일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await eventBannersService.getAll()
      setBanners(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching banners:', error)
      setError('배너를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingBanner(null)
    setFormValues({})
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleEdit = (banner: EventBanner) => {
    setEditingBanner(banner)
    setFormValues({
      ...banner,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : ''
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 배너를 삭제하시겠습니까?')) return

    try {
      await eventBannersService.delete(id)
      await fetchBanners()
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('배너 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingBanner) {
        await eventBannersService.update(editingBanner.id, formValues)
      } else {
        await eventBannersService.create(formValues)
      }

      setIsModalOpen(false)
      setFormValues({})
      setFormErrors({})
      await fetchBanners()
    } catch (error) {
      console.error('Error saving banner:', error)
      alert('배너 저장에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFormChange = (key: string, value: any) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: '' }))
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
          onClick={fetchBanners}
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
          <h1 className="text-2xl font-bold text-gray-900">이벤트 배너 관리</h1>
          <p className="text-gray-600">이벤트 배너를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          배너 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        actions={[
          { label: 'Edit', onClick: (banner: EventBanner) => handleEdit(banner) },
          { label: 'Delete', onClick: (banner: EventBanner) => handleDelete(banner.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? '배너 수정' : '배너 추가'}
      >
        <FormBuilder
          fields={formFields}
          values={formValues}
          errors={formErrors}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}