import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { consultationsService } from '../services/features.service'
import type { ConsultationRequest } from '../types'

export const AdminConsultationsPage: React.FC = () => {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConsultation, setEditingConsultation] = useState<ConsultationRequest | null>(null)

  const statusOptions = [
    { value: 'pending', label: '대기중' },
    { value: 'in_review', label: '검토중' },
    { value: 'responded', label: '답변완료' },
    { value: 'scheduled', label: '예약됨' },
    { value: 'completed', label: '완료' },
    { value: 'cancelled', label: '취소' }
  ]

  const urgencyOptions = [
    { value: 'low', label: '낮음' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '높음' },
    { value: 'urgent', label: '긴급' }
  ]

  const formFields = [
    {
      key: 'status',
      label: '상태',
      type: 'select' as const,
      options: statusOptions,
      required: true
    },
    {
      key: 'assigned_provider_id',
      label: '담당 의료진 ID',
      type: 'number' as const,
      placeholder: '담당 의료진 ID를 입력하세요'
    },
    {
      key: 'response_notes',
      label: '답변 내용',
      type: 'textarea' as const,
      placeholder: '상담 답변을 입력하세요'
    },
    {
      key: 'estimated_cost_range',
      label: '예상 비용 범위',
      type: 'text' as const,
      placeholder: '예: 100만원 - 150만원'
    },
    {
      key: 'recommended_procedures',
      label: '추천 시술 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '추천 시술을 입력하세요'
    },
    {
      key: 'follow_up_required',
      label: '추가 상담 필요',
      type: 'checkbox' as const
    }
  ]

  const columns = [
    {
      key: 'patient_name',
      label: '환자명',
      render: (value: string, row: ConsultationRequest) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.patient_email}</div>
        </div>
      )
    },
    {
      key: 'consultation_type',
      label: '상담 유형',
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {value}
        </span>
      )
    },
    {
      key: 'urgency_level',
      label: '긴급도',
      render: (value: string) => {
        const colors = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800'
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value as keyof typeof colors] || colors.medium}`}>
            {urgencyOptions.find(opt => opt.value === value)?.label || value}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: '상태',
      render: (value: string) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          in_review: 'bg-blue-100 text-blue-800',
          responded: 'bg-green-100 text-green-800',
          scheduled: 'bg-purple-100 text-purple-800',
          completed: 'bg-gray-100 text-gray-800',
          cancelled: 'bg-red-100 text-red-800'
        }
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[value as keyof typeof colors] || colors.pending}`}>
            {statusOptions.find(opt => opt.value === value)?.label || value}
          </span>
        )
      }
    },
    {
      key: 'procedure_interest',
      label: '관심 시술',
      render: (value: string) => value || '-'
    },
    {
      key: 'created_at',
      label: '접수일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const data = await consultationsService.getAll()
      setConsultations(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching consultations:', error)
      setError('상담 요청을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (consultation: ConsultationRequest) => {
    setEditingConsultation(consultation)
    setIsModalOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      if (!editingConsultation) return

      // Process recommended_procedures
      if (data.recommended_procedures && typeof data.recommended_procedures === 'string') {
        data.recommended_procedures = data.recommended_procedures.split(',').map((proc: string) => proc.trim()).filter(Boolean)
      }

      await consultationsService.update(editingConsultation.id, data)
      setIsModalOpen(false)
      await fetchConsultations()
    } catch (error) {
      console.error('Error updating consultation:', error)
      alert('상담 요청 업데이트에 실패했습니다.')
    }
  }

  const getInitialFormData = () => {
    if (!editingConsultation) return {}

    return {
      ...editingConsultation,
      recommended_procedures: editingConsultation.recommended_procedures?.join(', ') || ''
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
          onClick={fetchConsultations}
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
          <h1 className="text-2xl font-bold text-gray-900">상담 요청 관리</h1>
          <p className="text-gray-600">고객 상담 요청을 관리합니다</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={consultations}
        actions={[
          { label: 'Edit', onClick: (consultation: ConsultationRequest) => handleEdit(consultation) }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="상담 요청 업데이트"
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