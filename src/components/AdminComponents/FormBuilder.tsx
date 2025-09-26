import React from 'react'
import styles from './FormBuilder.module.css'

interface FormField {
  key: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'time' | 'file'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  width?: 'full' | 'half' | 'third'
  description?: string
}

interface FormBuilderProps {
  fields: FormField[]
  values: Record<string, any>
  errors: Record<string, string>
  onChange: (key: string, value: any) => void
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  isSubmitting?: boolean
  disabled?: boolean
  layout?: 'vertical' | 'horizontal'
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  fields,
  values,
  errors,
  onChange,
  onSubmit,
  submitLabel = '저장',
  isSubmitting = false,
  disabled = false,
  layout = 'vertical'
}) => {
  const renderField = (field: FormField) => {
    const value = values[field.key] || ''
    const error = errors[field.key]
    const fieldId = `field-${field.key}`

    const commonProps = {
      id: fieldId,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = field.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value
        onChange(field.key, newValue)
      },
      disabled: disabled || isSubmitting,
      className: error ? styles.fieldError : '',
      required: field.required
    }

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              {...commonProps}
              placeholder={field.placeholder}
              rows={4}
              className={`${styles.textarea} ${error ? styles.fieldError : ''}`}
            />
          )

        case 'select':
          return (
            <select
              {...commonProps}
              className={`${styles.select} ${error ? styles.fieldError : ''}`}
            >
              <option value="">{field.placeholder || '선택하세요'}</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )

        case 'checkbox':
          return (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => onChange(field.key, e.target.checked)}
                disabled={disabled || isSubmitting}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{field.label}</span>
            </label>
          )

        case 'file':
          return (
            <input
              type="file"
              id={fieldId}
              onChange={(e) => {
                const file = e.target.files?.[0]
                onChange(field.key, file)
              }}
              disabled={disabled || isSubmitting}
              className={`${styles.fileInput} ${error ? styles.fieldError : ''}`}
            />
          )

        default:
          return (
            <input
              {...commonProps}
              type={field.type}
              placeholder={field.placeholder}
              className={`${styles.input} ${error ? styles.fieldError : ''}`}
              min={field.validation?.min}
              max={field.validation?.max}
              pattern={field.validation?.pattern}
            />
          )
      }
    }

    return (
      <div key={field.key} className={`${styles.fieldGroup} ${styles[field.width || 'full']}`}>
        {field.type !== 'checkbox' && (
          <label htmlFor={fieldId} className={styles.label}>
            {field.label}
            {field.required && <span className={styles.required}>*</span>}
          </label>
        )}

        {renderInput()}

        {field.description && (
          <p className={styles.description}>{field.description}</p>
        )}

        {error && (
          <span className={styles.errorMessage}>{error}</span>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${styles[layout]}`}>
      <div className={styles.fieldsContainer}>
        {fields.map(renderField)}
      </div>

      <div className={styles.formActions}>
        <button
          type="submit"
          disabled={isSubmitting || disabled}
          className={styles.submitButton}
        >
          {isSubmitting ? '저장 중...' : submitLabel}
        </button>
      </div>
    </form>
  )
}