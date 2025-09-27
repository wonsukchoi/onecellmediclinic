import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal } from '../components/AdminComponents/Modal'
import { providersService } from '../services/features.service'
import type { Provider } from '../types'

export const AdminProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  const formFields = [
    {
      key: 'full_name',
      label: '의료진 이름',
      type: 'text' as const,
      required: true,
      placeholder: '의료진 이름을 입력하세요'
    },
    {
      key: 'title',
      label: '직책',
      type: 'text' as const,
      placeholder: '예: 원장, 부원장, 전문의'
    },
    {
      key: 'specialization',
      label: '전문분야',
      type: 'text' as const,
      placeholder: '예: 성형외과, 피부과, 미용외과'
    },
    {
      key: 'bio',
      label: '프로필 소개',
      type: 'textarea' as const,
      placeholder: '의료진 소개를 입력하세요'
    },
    {
      key: 'profile_image_url',
      label: '프로필 이미지 URL',
      type: 'text' as const,
      placeholder: 'https://example.com/profile.jpg'
    },
    {
      key: 'years_experience',
      label: '경력 (년)',
      type: 'number' as const,
      placeholder: '경력 년수를 입력하세요'
    },
    {
      key: 'education',
      label: '학력 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '서울대학교 의과대학, 연세대학교 대학원'
    },
    {
      key: 'certifications',
      label: '자격증 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '성형외과 전문의, 피부과 전문의'
    },
    {
      key: 'languages',
      label: '사용 언어 (쉼표로 구분)',
      type: 'text' as const,
      placeholder: '한국어, 영어, 일본어'
    },
    {
      key: 'consultation_fee',
      label: '상담료',
      type: 'number' as const,
      placeholder: '50000'
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
      key: 'full_name',
      label: '의료진명',
      render: (value: string, row: Provider) => (
        <div className="flex items-center">
          {row.profile_image_url && (
            <img
              src={row.profile_image_url}
              alt={value}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
          )}
          <div>
            <div className="font-medium">{value}</div>
            {row.title && (
              <div className="text-sm text-gray-500">{row.title}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'specialization',
      label: '전문분야',
      render: (value: string) => value || '-'
    },
    {
      key: 'years_experience',
      label: '경력',
      render: (value: number) => value ? `${value}년` : '-'
    },
    {
      key: 'consultation_fee',
      label: '상담료',
      render: (value: number) => value ? `${value.toLocaleString()}원` : '-'
    },
    {
      key: 'languages',
      label: '언어',
      render: (value: string[]) => {
        if (!value || value.length === 0) return '-'
        return (
          <div className="flex flex-wrap gap-1">
            {value.slice(0, 2).map((lang, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
              >
                {lang}
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
      label: '등록일',
      render: (value: string) => new Date(value).toLocaleDateString('ko-KR')
    }
  ]

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      setLoading(true)
      const data = await providersService.getAll()
      setProviders(data || [])
      setError(null)
    } catch (error) {
      console.error('Error fetching providers:', error)
      setError('의료진 정보를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingProvider(null)
    setIsModalOpen(true)
  }

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 의료진 정보를 삭제하시겠습니까?')) return

    try {
      await providersService.delete(id)
      await fetchProviders()
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert('의료진 삭제에 실패했습니다.')
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      // Process array fields
      if (data.education && typeof data.education === 'string') {
        data.education = data.education.split(',').map((item: string) => item.trim()).filter(Boolean)
      }
      if (data.certifications && typeof data.certifications === 'string') {
        data.certifications = data.certifications.split(',').map((item: string) => item.trim()).filter(Boolean)
      }
      if (data.languages && typeof data.languages === 'string') {
        data.languages = data.languages.split(',').map((item: string) => item.trim()).filter(Boolean)
      }

      if (editingProvider) {
        await providersService.update(editingProvider.id, data)
      } else {
        await providersService.create(data)
      }

      setIsModalOpen(false)
      await fetchProviders()
    } catch (error) {
      console.error('Error saving provider:', error)
      alert('의료진 정보 저장에 실패했습니다.')
    }
  }

  const getInitialFormData = () => {
    if (!editingProvider) return {}

    return {
      ...editingProvider,
      education: editingProvider.education?.join(', ') || '',
      certifications: editingProvider.certifications?.join(', ') || '',
      languages: editingProvider.languages?.join(', ') || ''
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
          onClick={fetchProviders}
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
          <h1 className="text-2xl font-bold text-gray-900">의료진 관리</h1>
          <p className="text-gray-600">의료진 정보를 관리합니다</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          의료진 추가
        </button>
      </div>

      <DataTable
        columns={columns}
        data={providers}
        actions={[
          { label: 'Edit', onClick: (item: Provider) => handleEdit(item) },
          { label: 'Delete', onClick: (item: Provider) => handleDelete(item.id), variant: 'danger' }
        ]}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProvider ? '의료진 수정' : '의료진 추가'}
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