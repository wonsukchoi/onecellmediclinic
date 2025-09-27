import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { eventsService } from '../services/features.service'

interface EventBanner {
  id: number
  title: string
  description?: string
  image_url?: string
  event_type: string
  discount_percentage?: number
  end_date?: string
  registration_link?: string
  max_participants?: number
  participants_count: number
  event_location?: string
  featured: boolean
  active: boolean
  created_at: string
}

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventBanner | null>(null)

  const eventTypes = [
    { value: 'promotion', label: '프로모션' },
    { value: 'discount', label: '할인' },
    { value: 'consultation', label: '상담' },
    { value: 'event', label: '이벤트' },
    { value: 'seminar', label: '세미나' }
  ]

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '이벤트 제목을 입력하세요'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      placeholder: '이벤트에 대한 자세한 설명을 입력하세요'
    },
    {
      key: 'event_type',
      label: '이벤트 유형',
      type: 'select' as const,
      options: eventTypes,
      required: true
    },
    {
      key: 'image_url',
      label: '이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/event-image.jpg'
    },
    {
      key: 'discount_percentage',
      label: '할인율 (%)',
      type: 'number' as const,
      placeholder: '20'
    },
    {
      key: 'end_date',
      label: '종료일',
      type: 'text' as const
    },
    {
      key: 'registration_link',
      label: '신청 링크',
      type: 'text' as const,
      placeholder: 'https://example.com/register'
    },
    {
      key: 'max_participants',
      label: '최대 참가자',
      type: 'number' as const,
      placeholder: '100'
    },
    {
      key: 'event_location',
      label: '장소',
      type: 'text' as const,
      placeholder: '원셀 메디클리닉'
    },
    {
      key: 'featured',
      label: '추천 이벤트',
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
      render: (value: string, row: EventBanner) => (
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
      key: 'event_type',
      label: '유형',
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {eventTypes.find(t => t.value === value)?.label || value}
        </span>
      )
    },
    {
      key: 'discount_percentage',
      label: '할인',
      render: (value: number) => value ? `${value}%` : '-'
    },
    {
      key: 'participants_count',
      label: '참가자',
      render: (value: number, row: EventBanner) => {
        if (!row.max_participants) return value.toString()
        return `${value} / ${row.max_participants}`
      }
    },
    {
      key: 'end_date',
      label: '종료일',
      render: (value: string) => {
        if (!value) return '-'
        const date = new Date(value)
        const isExpired = date < new Date()
        return (
          <span className={isExpired ? 'text-red-600' : 'text-green-600'}>
            {date.toLocaleDateString('ko-KR')}
          </span>
        )
      }
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
    }
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await eventsService.getAll()
      setEvents(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('이벤트를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEdit = (event: EventBanner) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 이벤트를 삭제하시겠습니까?')) return

    try {
      await eventsService.delete(id)
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('이벤트 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingEvent) {
        await eventsService.update(editingEvent.id, data)
      } else {
        await eventsService.create(data)
      }

      setIsModalOpen(false)
      await fetchEvents()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('이벤트 저장에 실패했습니다.')
    }
  }

  const getInitialFormData = () => {
    if (!editingEvent) return {}

    return {
      ...editingEvent,
      end_date: editingEvent.end_date
        ? new Date(editingEvent.end_date).toISOString().slice(0, 16)
        : ''
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
          onClick={fetchEvents}
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
          <h1 className="text-2xl font-bold text-gray-900">이벤트 관리</h1>
          <p className="text-gray-600">이벤트와 프로모션을 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          이벤트 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={events}
        actions={[
          { label: 'Edit', onClick: (item: EventBanner) => handleEdit(item) },
          { label: 'Delete', onClick: (item: EventBanner) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? '이벤트 수정' : '이벤트 추가'}
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