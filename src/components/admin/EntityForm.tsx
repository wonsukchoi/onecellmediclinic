import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from '../icons';
import styles from './EntityForm.module.css';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'select' | 'checkbox' | 'url' | 'email' | 'tel' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | undefined;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  rows?: number;
}

export interface EntityFormProps {
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
  title: string;
  submitLabel?: string;
  cancelLabel?: string;
}

const EntityForm: React.FC<EntityFormProps> = ({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  title,
  submitLabel = '저장',
  cancelLabel = '취소',
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [mediaPreview, setMediaPreview] = useState<Record<string, string>>({});

  // Initialize form data when initialData changes
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  // Generate media preview URLs
  useEffect(() => {
    const newPreviews: Record<string, string> = {};

    fields.forEach(field => {
      if (field.type === 'url' && formData[field.key]) {
        const url = formData[field.key];
        if (typeof url === 'string') {
          // Check if it's a video URL
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = extractYouTubeId(url);
            if (videoId) {
              newPreviews[field.key] = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
          } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            // Image URL
            newPreviews[field.key] = url;
          }
        }
      }
    });

    setMediaPreview(newPreviews);
  }, [formData, fields]);

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const validateField = useCallback((field: FormField, value: any): string | undefined => {
    // Required field validation
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label}은(는) 필수 입력 항목입니다`;
    }

    // Custom validation
    if (field.validation && value) {
      return field.validation(value);
    }

    // Type-specific validation
    if (value && typeof value === 'string' && value.trim() !== '') {
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return '올바른 이메일 주소를 입력해주세요';
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            return '올바른 URL을 입력해주세요';
          }
          break;
        case 'tel':
          const phoneRegex = /^[0-9-+\s()]+$/;
          if (!phoneRegex.test(value)) {
            return '올바른 전화번호를 입력해주세요';
          }
          break;
      }
    }

    // Number validation
    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return '숫자를 입력해주세요';
      }
      if (field.min !== undefined && numValue < field.min) {
        return `${field.min} 이상의 값을 입력해주세요`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.max} 이하의 값을 입력해주세요`;
      }
    }

    return undefined;
  }, []);

  const handleFieldChange = useCallback((fieldKey: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldKey]: value }));

    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => ({ ...prev, [fieldKey]: '' }));
    }
  }, [errors]);

  const handleFieldBlur = useCallback((field: FormField) => {
    setTouched(prev => ({ ...prev, [field.key]: true }));

    const error = validateField(field, formData[field.key]);
    setErrors(prev => ({ ...prev, [field.key]: error || '' }));
  }, [formData, validateField]);

  const handleTagsChange = useCallback((fieldKey: string, value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    handleFieldChange(fieldKey, tags);
  }, [handleFieldChange]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.key]: true }), {}));

    return isValid;
  }, [fields, formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await onSubmit(formData);
      if (!result.success && result.error) {
        // Show general form error
        setErrors(prev => ({ ...prev, _form: result.error || '저장 중 오류가 발생했습니다' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, _form: '알 수 없는 오류가 발생했습니다' }));
    }
  }, [formData, validateForm, onSubmit]);

  const renderField = (field: FormField) => {
    const value = formData[field.key] || '';
    const error = touched[field.key] && errors[field.key];
    const hasPreview = mediaPreview[field.key];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            maxLength={field.maxLength}
            className={`${styles.textArea} ${error ? styles.error : ''}`}
            disabled={isLoading}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`${styles.input} ${error ? styles.error : ''}`}
            disabled={isLoading}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={`${styles.input} ${error ? styles.error : ''}`}
            disabled={isLoading}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={`${styles.input} ${error ? styles.error : ''}`}
            disabled={isLoading}
          />
        );

      case 'select':
        return (
          <select
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={`${styles.select} ${error ? styles.error : ''}`}
            disabled={isLoading}
          >
            <option value="">선택해주세요</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className={styles.checkboxWrapper}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleFieldChange(field.key, e.target.checked)}
              className={styles.checkbox}
              disabled={isLoading}
            />
            <span className={styles.checkboxLabel}>{field.label}</span>
          </label>
        );

      case 'tags':
        const tags = Array.isArray(value) ? value : [];
        return (
          <div className={styles.tagsField}>
            <input
              type="text"
              id={field.key}
              value={tags.join(', ')}
              onChange={(e) => handleTagsChange(field.key, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              placeholder={field.placeholder || '태그를 쉼표로 구분하여 입력하세요'}
              className={`${styles.input} ${error ? styles.error : ''}`}
              disabled={isLoading}
            />
            {tags.length > 0 && (
              <div className={styles.tagsPreview}>
                {tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className={styles.fieldWithPreview}>
            <input
              type={field.type}
              id={field.key}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              onBlur={() => handleFieldBlur(field)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className={`${styles.input} ${error ? styles.error : ''}`}
              disabled={isLoading}
            />
            {hasPreview && (
              <div className={styles.mediaPreview}>
                <img
                  src={mediaPreview[field.key]}
                  alt="미리보기"
                  className={styles.previewImage}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>{title}</h1>
      </div>

      {errors._form && (
        <div className={styles.formError}>
          <Icon name="alertTriangle" size="sm" />
          {errors._form}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {fields.map(field => {
          if (field.type === 'checkbox') {
            return (
              <div key={field.key} className={styles.checkboxField}>
                {renderField(field)}
                {touched[field.key] && errors[field.key] && (
                  <div className={styles.fieldError}>
                    <Icon name="alertTriangle" size="sm" />
                    {errors[field.key]}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={field.key} className={styles.field}>
              <label htmlFor={field.key} className={styles.label}>
                {field.label}
                {field.required && <span className={styles.required}>*</span>}
              </label>
              {renderField(field)}
              {touched[field.key] && errors[field.key] && (
                <div className={styles.fieldError}>
                  <Icon name="alertTriangle" size="sm" />
                  {errors[field.key]}
                </div>
              )}
            </div>
          );
        })}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon name="loader" size="sm" />
                저장 중...
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;