import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EntityForm, { type FormField } from '../../components/admin/EntityForm';
import { AdminService } from '../../services/supabase';
import { Icon } from '../../components/icons';
import styles from './EntityFormPage.module.css';

export interface EntityFormConfig {
  name: string;
  singularName: string;
  tableName: string;
  fields: FormField[];
  listPath: string;
  defaultValues?: Record<string, any>;
}

interface EntityFormPageProps {
  config: EntityFormConfig;
}

const EntityFormPage: React.FC<EntityFormPageProps> = ({ config }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState<Record<string, any>>(config.defaultValues || {});
  const [error, setError] = useState<string | null>(null);

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && id) {
      loadEntityData(id);
    } else {
      // Apply default values for create mode
      setInitialData({ ...config.defaultValues || {} });
      setLoading(false);
    }
  }, [id, isEdit, config.defaultValues]);

  const loadEntityData = async (entityId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await AdminService.getById(config.tableName, entityId);

      if (result.success && result.data) {
        // Process the data to handle arrays and special fields
        const processedData = { ...result.data };

        // Convert tags array to string format for form
        config.fields.forEach(field => {
          if (field.type === 'tags' && Array.isArray((processedData as any)[field.key])) {
            // Keep as array for form handling
          } else if (field.type === 'datetime' && (processedData as any)[field.key]) {
            // Convert datetime to local datetime string
            const date = new Date((processedData as any)[field.key]);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            (processedData as any)[field.key] = localDate.toISOString().slice(0, 16);
          } else if (field.type === 'date' && (processedData as any)[field.key]) {
            // Convert date to YYYY-MM-DD format
            const date = new Date((processedData as any)[field.key]);
            (processedData as any)[field.key] = date.toISOString().split('T')[0];
          }
        });

        setInitialData(processedData);
      } else {
        setError(result.error || `${config.singularName}을(를) 불러올 수 없습니다`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useCallback(async (formData: Record<string, any>) => {
    try {
      setSaving(true);
      setError(null);

      // Process form data before submission
      const processedData = { ...formData };

      // Handle special field types
      config.fields.forEach(field => {
        const value = processedData[field.key];

        switch (field.type) {
          case 'number':
            if (value !== undefined && value !== '') {
              processedData[field.key] = Number(value);
            } else if (!field.required) {
              processedData[field.key] = null;
            }
            break;

          case 'checkbox':
            processedData[field.key] = Boolean(value);
            break;

          case 'tags':
            // Tags are already processed as arrays in the form
            if (!Array.isArray(value)) {
              processedData[field.key] = [];
            }
            break;

          case 'datetime':
            if (value) {
              // Convert local datetime to UTC
              processedData[field.key] = new Date(value).toISOString();
            }
            break;

          case 'date':
            if (value) {
              // Keep date as is for date fields
              processedData[field.key] = value;
            }
            break;

          default:
            // Handle empty strings for optional fields
            if (!field.required && value === '') {
              processedData[field.key] = null;
            }
        }
      });

      // Remove undefined fields
      Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
          delete processedData[key];
        }
      });

      let result;
      if (isEdit && id) {
        // Remove readonly fields for updates
        const updateData = { ...processedData };
        delete updateData.id;
        delete updateData.created_at;
        delete updateData.updated_at;

        result = await AdminService.update(config.tableName, id, updateData);
      } else {
        result = await AdminService.create(config.tableName, processedData);
      }

      if (result.success) {
        // Navigate back to list page
        navigate(config.listPath);
        return { success: true };
      } else {
        return { success: false, error: result.error || '저장에 실패했습니다' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류입니다';
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, [config, isEdit, id, navigate]);

  const handleCancel = useCallback(() => {
    navigate(config.listPath);
  }, [navigate, config.listPath]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Icon name="loader" size="md" />
        <span>데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <Icon name="alertTriangle" size="md" />
          <div>
            <h3>오류가 발생했습니다</h3>
            <p>{error}</p>
          </div>
        </div>
        <button
          onClick={handleCancel}
          className={styles.backButton}
        >
          <Icon name="arrowLeft" size="sm" />
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const title = isEdit
    ? `${config.singularName} 편집`
    : `새 ${config.singularName} 추가`;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <button
          onClick={handleCancel}
          className={styles.backButton}
        >
          <Icon name="arrowLeft" size="sm" />
          목록으로 돌아가기
        </button>
      </div>

      <EntityForm
        title={title}
        fields={config.fields}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saving}
        submitLabel={isEdit ? '업데이트' : '생성'}
        cancelLabel="취소"
      />
    </div>
  );
};

export default EntityFormPage;