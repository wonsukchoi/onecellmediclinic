import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { differentiatorsService } from '../services/features.service'

interface Differentiator {
  id: number
  title: string
  subtitle?: string
  description?: string
  icon?: string
  icon_url?: string
  stats_number?: string
  stats_label?: string
  background_color?: string
  text_color?: string
  order_index: number
  active: boolean
  created_at: string
}

export const AdminDifferentiatorsPage: React.FC = () => {
  const [differentiators, setDifferentiators] = useState<Differentiator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDifferentiator, setEditingDifferentiator] = useState<Differentiator | null>(null)

  const formFields = [
    {
      key: 'title',
      label: '제목',
      type: 'text' as const,
      required: true,
      placeholder: '차별화 요소 제목을 입력하세요'
    },
    {
      key: 'subtitle',
      label: '부제목',
      type: 'text' as const,
      placeholder: '부제목을 입력하세요'
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea' as const,
      placeholder: '차별화 요소에 대한 설명을 입력하세요'
    },
    {
      key: 'icon',
      label: '아이콘 이름',
      type: 'text' as const,
      placeholder: '예: heart, star, shield (FontAwesome 아이콘명)'
    },
    {
      key: 'icon_url',
      label: '아이콘 이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/icon.svg'
    },
    {
      key: 'stats_number',
      label: '통계 숫자',
      type: 'text' as const,
      placeholder: '예: 10,000+, 99%, 24시간'
    },
    {
      key: 'stats_label',
      label: '통계 라벨',
      type: 'text' as const,
      placeholder: '예: 만족한 고객, 성공률, 응급대응'
    },
    {
      key: 'background_color',
      label: '배경색',
      type: 'text' as const,
      placeholder: '예: #3B82F6, blue-500'
    },
    {
      key: 'text_color',
      label: '텍스트 색상',
      type: 'text' as const,
      placeholder: '예: #FFFFFF, white'
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
      render: (value: string, row: Differentiator) => (
        <div className="flex items-center">
          {row.icon_url ? (
            <img
              src={row.icon_url}
              alt={value}
              className="w-8 h-8 mr-3"
            />
          ) : row.icon ? (
            <div className="w-8 h-8 mr-3 flex items-center justify-center bg-gray-100 rounded-full">
              <span className="text-xs">{row.icon}</span>
            </div>
          ) : null}
          <div>
            <div className="font-medium">{value}</div>
            {row.subtitle && (
              <div className="text-sm text-gray-500">{row.subtitle}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'stats_number',
      label: '통계',
      render: (value: string, row: Differentiator) => {
        if (!value && !row.stats_label) return '-'
        return (
          <div className="text-center">
            {value && (
              <div className="font-bold text-lg text-blue-600">{value}</div>
            )}
            {row.stats_label && (
              <div className="text-xs text-gray-500">{row.stats_label}</div>
            )}
          </div>
        )
      }
    },
    {
      key: 'background_color',
      label: '색상',
      render: (value: string, row: Differentiator) => (
        <div className="flex items-center space-x-2">
          {value && (
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: value.startsWith('#') ? value : `var(--${value})` }}
            />
          )}
          {row.text_color && (
            <div
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: row.text_color.startsWith('#') ? row.text_color : `var(--${row.text_color})` }}
            />
          )}
        </div>
      )
    },
    {
      key: 'order_index',
      label: '순서',
      render: (value: number) => (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
          {value}
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
      key: 'description',
      label: '설명',
      render: (value: string) => value ? (
        <div className="max-w-xs truncate text-sm text-gray-600">
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'created_at',
      label: '등록일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchDifferentiators()
  }, [])

  const fetchDifferentiators = async () => {
    try {
      setLoading(true)
      const data = await differentiatorsService.getAll()
      setDifferentiators(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching differentiators:', error)
      setError('차별화 요소를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingDifferentiator(null)
    setIsModalOpen(true)
  }

  const handleEdit = (differentiator: Differentiator) => {
    setEditingDifferentiator(differentiator)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 차별화 요소를 삭제하시겠습니까?')) return

    try {
      await differentiatorsService.delete(id)
      await fetchDifferentiators()
    } catch (error) {
      console.error('Error deleting differentiator:', error)
      alert('차별화 요소 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingDifferentiator) {
        await differentiatorsService.update(editingDifferentiator.id, data)
      } else {
        await differentiatorsService.create(data)
      }

      setIsModalOpen(false)
      await fetchDifferentiators()
    } catch (error) {
      console.error('Error saving differentiator:', error)
      alert('차별화 요소 저장에 실패했습니다.')
    }
  }


  const getInitialFormData = () => {
    if (!editingDifferentiator) return {}
    return editingDifferentiator
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
          onClick={fetchDifferentiators}
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
          <h1 className="text-2xl font-bold text-gray-900">차별화 요소 관리</h1>
          <p className="text-gray-600">클리닉의 차별화 요소를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          차별화 요소 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={differentiators}
        actions={[
          { label: 'Edit', onClick: (item: Differentiator) => handleEdit(item) },
          { label: 'Delete', onClick: (item: Differentiator) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDifferentiator ? '차별화 요소 수정' : '차별화 요소 추가'}
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