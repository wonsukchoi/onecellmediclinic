import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { selfieReviewsService } from '../services/features.service'

interface SelfieReview {
  id: number
  patient_name: string
  patient_initial?: string
  procedure_type?: string
  procedure_id?: number
  selfie_url: string
  review_text?: string
  rating?: number
  verified: boolean
  featured: boolean
  patient_age_range?: string
  treatment_date?: string
  recovery_weeks?: number
  consent_given: boolean
  display_order: number
  tags?: string[]
  moderation_status: string
  moderation_notes?: string
  created_at: string
}

export const AdminSelfieReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<SelfieReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<SelfieReview | null>(null)

  const moderationStatusOptions = [
    { value: 'pending', label: '검토 대기' },
    { value: 'approved', label: '승인됨' },
    { value: 'rejected', label: '거부됨' },
    { value: 'needs_review', label: '재검토 필요' }
  ]

  const formFields = [
    {
      key: 'patient_name',
      label: '환자명',
      type: 'text' as const,
      required: true,
      placeholder: '환자 이름을 입력하세요'
    },
    {
      key: 'patient_initial',
      label: '환자 이니셜',
      type: 'text' as const,
      placeholder: '예: 김○○'
    },
    {
      key: 'procedure_type',
      label: '시술 종류',
      type: 'text' as const,
      placeholder: '예: 코성형, 눈성형'
    },
    {
      key: 'procedure_id',
      label: '시술 ID',
      type: 'number' as const,
      placeholder: '관련 시술 ID를 입력하세요'
    },
    {
      key: 'selfie_url',
      label: '셀카 이미지 URL',
      type: 'text' as const,
      required: true,
      placeholder: 'https://example.com/selfie.jpg'
    },
    {
      key: 'review_text',
      label: '후기 내용',
      type: 'textarea' as const,
      placeholder: '환자 후기를 입력하세요'
    },
    {
      key: 'rating',
      label: '평점 (1-5)',
      type: 'number' as const,
      placeholder: '1-5 사이의 평점을 입력하세요'
    },
    {
      key: 'patient_age_range',
      label: '환자 연령대',
      type: 'text' as const,
      placeholder: '예: 20대 후반, 30대 초반'
    },
    {
      key: 'treatment_date',
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
      key: 'tags',
      label: '태그 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '자연스러운, 만족, 추천'
    },
    {
      key: 'moderation_status',
      label: '검토 상태',
      type: 'select' as const,
      options: moderationStatusOptions,
      required: true
    },
    {
      key: 'moderation_notes',
      label: '검토 노트',
      type: 'textarea' as const,
      placeholder: '검토 관련 메모를 입력하세요'
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
      key: 'verified',
      label: '인증됨',
      type: 'checkbox' as const,
      defaultValue: false
    },
    {
      key: 'featured',
      label: '추천 후기',
      type: 'checkbox' as const,
      defaultValue: false
    }
  ]

  const columns = [
    {
      key: 'patient_name',
      label: '환자',
      render: (value: string, row: SelfieReview) => (
        <div className="flex items-center">
          <img
            src={row.selfie_url}
            alt="Selfie"
            className="w-12 h-12 object-cover rounded-full mr-3"
          />
          <div>
            <div className="font-medium">{row.patient_initial || value}</div>
            <div className="text-sm text-gray-500">{row.procedure_type}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      label: '평점',
      render: (value: number) => {
        if (!value) return '-'
        return (
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-sm ${
                  i < value ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        )
      }
    },
    {
      key: 'moderation_status',
      label: '검토 상태',
      render: (value: string) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          needs_review: 'bg-orange-100 text-orange-800'
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value as keyof typeof colors] || colors.pending}`}>
            {moderationStatusOptions.find(opt => opt.value === value)?.label || value}
          </span>
        )
      }
    },
    {
      key: 'verified',
      label: '인증',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '인증됨' : '미인증'}
        </span>
      )
    },
    {
      key: 'featured',
      label: '추천',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? '추천' : '일반'}
        </span>
      )
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
      key: 'created_at',
      label: '등록일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const data = await selfieReviewsService.getAll()
      setReviews(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching selfie reviews:', error)
      setError('셀카 후기를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingReview(null)
    setIsModalOpen(true)
  }

  const handleEdit = (review: SelfieReview) => {
    setEditingReview(review)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 셀카 후기를 삭제하시겠습니까?')) return

    try {
      await selfieReviewsService.delete(id)
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting selfie review:', error)
      alert('셀카 후기 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      // Process tags
      if (data.tags && typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      }

      if (editingReview) {
        await selfieReviewsService.update(editingReview.id, data)
      } else {
        await selfieReviewsService.create(data)
      }

      setIsModalOpen(false)
      await fetchReviews()
    } catch (error) {
      console.error('Error saving selfie review:', error)
      alert('셀카 후기 저장에 실패했습니다.')
    }
  }

  const getInitialFormData = () => {
    if (!editingReview) return {}

    return {
      ...editingReview,
      tags: editingReview.tags?.join(', ') || '',
      treatment_date: editingReview.treatment_date ? editingReview.treatment_date.split('T')[0] : ''
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
          onClick={fetchReviews}
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
          <h1 className="text-2xl font-bold text-gray-900">셀카 후기 관리</h1>
          <p className="text-gray-600">환자 셀카 후기를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          후기 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        actions={[
          { label: 'Edit', onClick: (item: SelfieReview) => handleEdit(item) },
          { label: 'Delete', onClick: (item: SelfieReview) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReview ? '후기 수정' : '후기 추가'}
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