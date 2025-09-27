import React, { useState, useEffect } from 'react'
import { DataTable } from '../components/AdminComponents/DataTable'
import { FormBuilder } from '../components/AdminComponents/FormBuilder'
import { Modal, ConfirmModal } from '../components/AdminComponents/Modal'
import { proceduresService } from '../services/features.service'
import type { Procedure, ProcedureCategory, TableColumn, FilterParams, PaginationParams, SortParams } from '../types'
import styles from './AdminProceduresPage.module.css'

export const AdminProceduresPage: React.FC = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [categories, setCategories] = useState<ProcedureCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingProcedure, setDeletingProcedure] = useState<Procedure | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, limit: 20 })
  const [sorting, setSorting] = useState<SortParams>({ field: 'display_order', direction: 'asc' })

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    detailed_description: '',
    duration_minutes: '',
    price_range: '',
    preparation_instructions: '',
    recovery_time: '',
    active: true,
    display_order: 0,
    tags: [] as string[]
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const columns: TableColumn[] = [
    {
      key: 'name',
      label: '시술명',
      sortable: true,
      render: (value, item) => (
        <div className={styles.procedureName}>
          <strong>{value}</strong>
          {item.category && (
            <span className={styles.categoryBadge}>{item.category.name}</span>
          )}
        </div>
      )
    },
    {
      key: 'duration_minutes',
      label: '소요시간',
      render: (value) => value ? `${value}분` : '-'
    },
    {
      key: 'price_range',
      label: '가격대',
      render: (value) => value || '-'
    },
    {
      key: 'active',
      label: '상태',
      render: (value) => (
        <span className={`${styles.statusBadge} ${value ? styles.active : styles.inactive}`}>
          {value ? '활성' : '비활성'}
        </span>
      )
    },
    {
      key: 'display_order',
      label: '순서',
      sortable: true
    }
  ]

  const formFields = [
    {
      key: 'name',
      label: '시술명',
      type: 'text' as const,
      required: true,
      placeholder: '시술명을 입력하세요'
    },
    {
      key: 'category_id',
      label: '카테고리',
      type: 'select' as const,
      required: true,
      options: categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))
    },
    {
      key: 'description',
      label: '간단 설명',
      type: 'textarea' as const,
      placeholder: '시술에 대한 간단한 설명을 입력하세요'
    },
    {
      key: 'detailed_description',
      label: '상세 설명',
      type: 'textarea' as const,
      placeholder: '시술에 대한 상세한 설명을 입력하세요'
    },
    {
      key: 'duration_minutes',
      label: '소요시간 (분)',
      type: 'number' as const,
      placeholder: '60',
      width: 'half' as const
    },
    {
      key: 'price_range',
      label: '가격대',
      type: 'text' as const,
      placeholder: '예: ₩50,000 - ₩100,000',
      width: 'half' as const
    },
    {
      key: 'preparation_instructions',
      label: '사전 준비사항',
      type: 'textarea' as const,
      placeholder: '시술 전 준비해야 할 사항들을 입력하세요'
    },
    {
      key: 'recovery_time',
      label: '회복 기간',
      type: 'text' as const,
      placeholder: '예: 1-2주',
      width: 'half' as const
    },
    {
      key: 'display_order',
      label: '표시 순서',
      type: 'number' as const,
      placeholder: '0',
      width: 'half' as const
    },
    {
      key: 'active',
      label: '활성 상태',
      type: 'checkbox' as const
    }
  ]

  useEffect(() => {
    fetchData()
    fetchCategories()
  }, [filters, pagination, sorting])

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await proceduresService.getAll(filters)
      setProcedures(data || [])
    } catch (error) {
      console.error('Error fetching procedures:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      // For now, use static categories - this can be enhanced later
      setCategories([
        { id: 1, name: '성형외과', display_order: 1, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, name: '피부과', display_order: 2, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, name: '미용외과', display_order: 3, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, name: '비수술', display_order: 4, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleCreate = () => {
    setEditingProcedure(null)
    setFormData({
      name: '',
      category_id: '',
      description: '',
      detailed_description: '',
      duration_minutes: '',
      price_range: '',
      preparation_instructions: '',
      recovery_time: '',
      active: true,
      display_order: procedures.length,
      tags: [] as string[]
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure)
    setFormData({
      name: procedure.name,
      category_id: procedure.category_id.toString(),
      description: procedure.description || '',
      detailed_description: procedure.detailed_description || '',
      duration_minutes: procedure.duration_minutes?.toString() || '',
      price_range: procedure.price_range || '',
      preparation_instructions: procedure.preparation_instructions || '',
      recovery_time: procedure.recovery_time || '',
      active: procedure.active,
      display_order: procedure.display_order,
      tags: procedure.tags || []
    })
    setFormErrors({})
    setShowModal(true)
  }

  const handleDelete = (procedure: Procedure) => {
    setDeletingProcedure(procedure)
    setShowDeleteModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})

    try {
      const submitData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      }

      if (editingProcedure) {
        await proceduresService.update(editingProcedure.id, submitData)
      } else {
        await proceduresService.create(submitData)
      }

      setShowModal(false)
      fetchData()
    } catch (error) {
      setFormErrors({ general: '저장 중 오류가 발생했습니다' })
    }
  }

  const confirmDelete = async () => {
    if (!deletingProcedure) return

    try {
      await proceduresService.delete(deletingProcedure.id)
      setShowDeleteModal(false)
      setDeletingProcedure(null)
      fetchData()
    } catch (error) {
      console.error('Error deleting procedure:', error)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value })
    setPagination({ ...pagination, page: 1 })
  }

  const actions = [
    {
      label: '편집',
      onClick: (item: Procedure) => handleEdit(item),
      variant: 'secondary' as const,
      icon: '✏️'
    },
    {
      label: '삭제',
      onClick: (item: Procedure) => handleDelete(item),
      variant: 'danger' as const,
      icon: '🗑️'
    }
  ]

  return (
    <div className={styles.proceduresPage}>
      <div className={styles.pageHeader}>
        <div>
          <h1>시술 관리</h1>
          <p>클리닉에서 제공하는 시술들을 관리합니다</p>
        </div>
        <button onClick={handleCreate} className={styles.createButton}>
          + 새 시술 추가
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="시술명 검색..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterGroup}>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">모든 카테고리</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={procedures}
        columns={columns}
        loading={loading}
        actions={actions}
        emptyMessage="등록된 시술이 없습니다"
        sorting={{
          sortBy: sorting.field,
          sortDirection: sorting.direction,
          onSort: setSorting
        }}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProcedure ? '시술 수정' : '새 시술 추가'}
        size="lg"
      >
        <FormBuilder
          fields={formFields}
          values={formData}
          errors={formErrors}
          onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          onSubmit={handleFormSubmit}
        />
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="시술 삭제"
        message={`'${deletingProcedure?.name}' 시술을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        variant="danger"
        confirmLabel="삭제"
      />
    </div>
  )
}