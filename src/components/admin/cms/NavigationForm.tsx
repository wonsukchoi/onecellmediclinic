import React, { useState, useEffect } from 'react';
import type { HeaderNavigation, NavigationFormData, NavType } from '../../../types';
import { Icon } from '../../icons';
import styles from './NavigationForm.module.css';

interface NavigationFormProps {
  item?: HeaderNavigation;
  navigationItems: HeaderNavigation[];
  pages: any[];
  onSubmit: (formData: NavigationFormData) => void;
  onCancel: () => void;
}

const NavigationForm: React.FC<NavigationFormProps> = ({
  item,
  navigationItems,
  pages,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<NavigationFormData>({
    label: '',
    url: '',
    page_id: '',
    nav_type: 'link',
    parent_id: '',
    sort_order: 1,
    is_visible: true,
    icon_name: '',
    target_blank: false,
    css_classes: '',
    access_level: 'public',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        label: item.label,
        url: item.url || '',
        page_id: item.page_id || '',
        nav_type: item.nav_type,
        parent_id: item.parent_id || '',
        sort_order: item.sort_order,
        is_visible: item.is_visible,
        icon_name: item.icon_name || '',
        target_blank: item.target_blank,
        css_classes: item.css_classes || '',
        access_level: item.access_level,
      });
    }
  }, [item]);

  const handleInputChange = (field: keyof NavigationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      setError('메뉴 라벨을 입력해주세요');
      return false;
    }

    if (formData.nav_type === 'link' && !formData.url && !formData.page_id) {
      setError('링크 URL 또는 페이지를 선택해주세요');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  const navTypeOptions: { value: NavType; label: string; description: string }[] = [
    { value: 'link', label: '링크', description: '일반 링크 메뉴' },
    { value: 'dropdown', label: '드롭다운', description: '하위 메뉴가 있는 드롭다운' },
    { value: 'megamenu', label: '메가메뉴', description: '대형 드롭다운 메뉴' },
    { value: 'divider', label: '구분선', description: '메뉴 구분선' },
  ];

  const accessLevelOptions = [
    { value: 'public', label: '공개', description: '모든 사용자' },
    { value: 'member', label: '회원', description: '로그인한 사용자만' },
    { value: 'admin', label: '관리자', description: '관리자만' },
  ];

  const parentOptions = navigationItems.filter(nav => nav.id !== item?.id);

  return (
    <form onSubmit={handleSubmit} className={styles.navigationForm}>
      <div className={styles.formContent}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>기본 정보</h4>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              메뉴 라벨 <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              className={styles.input}
              placeholder="메뉴에 표시될 텍스트"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>메뉴 타입</label>
            <select
              value={formData.nav_type}
              onChange={(e) => handleInputChange('nav_type', e.target.value)}
              className={styles.select}
            >
              {navTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>상위 메뉴</label>
            <select
              value={formData.parent_id}
              onChange={(e) => handleInputChange('parent_id', e.target.value)}
              className={styles.select}
            >
              <option value="">최상위 메뉴</option>
              {parentOptions.map(nav => (
                <option key={nav.id} value={nav.id}>
                  {nav.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.nav_type === 'link' && (
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>링크 설정</h4>

            <div className={styles.formGroup}>
              <label className={styles.label}>링크 타입</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={!!formData.url}
                    onChange={() => {
                      handleInputChange('url', formData.url || 'https://');
                      handleInputChange('page_id', '');
                    }}
                    className={styles.radio}
                  />
                  <span>외부 URL</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="linkType"
                    checked={!!formData.page_id}
                    onChange={() => {
                      handleInputChange('page_id', formData.page_id || (pages[0]?.id || ''));
                      handleInputChange('url', '');
                    }}
                    className={styles.radio}
                  />
                  <span>내부 페이지</span>
                </label>
              </div>
            </div>

            {formData.url && (
              <div className={styles.formGroup}>
                <label className={styles.label}>URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={styles.input}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {formData.page_id && (
              <div className={styles.formGroup}>
                <label className={styles.label}>페이지 선택</label>
                <select
                  value={formData.page_id}
                  onChange={(e) => handleInputChange('page_id', e.target.value)}
                  className={styles.select}
                >
                  <option value="">페이지를 선택하세요</option>
                  {pages.map(page => (
                    <option key={page.id} value={page.id}>
                      {page.title} (/{page.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.target_blank}
                  onChange={(e) => handleInputChange('target_blank', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>새 탭에서 열기</span>
              </label>
            </div>
          </div>
        )}

        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>표시 설정</h4>

          <div className={styles.formGroup}>
            <label className={styles.label}>접근 권한</label>
            <select
              value={formData.access_level}
              onChange={(e) => handleInputChange('access_level', e.target.value)}
              className={styles.select}
            >
              {accessLevelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>정렬 순서</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 1)}
              className={styles.input}
              min="1"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => handleInputChange('is_visible', e.target.checked)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>메뉴 표시</span>
            </label>
          </div>
        </div>

        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>고급 설정</h4>

          <div className={styles.formGroup}>
            <label className={styles.label}>아이콘 이름 (선택사항)</label>
            <input
              type="text"
              value={formData.icon_name}
              onChange={(e) => handleInputChange('icon_name', e.target.value)}
              className={styles.input}
              placeholder="예: home, user, settings"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>CSS 클래스 (선택사항)</label>
            <input
              type="text"
              value={formData.css_classes}
              onChange={(e) => handleInputChange('css_classes', e.target.value)}
              className={styles.input}
              placeholder="추가 CSS 클래스명"
            />
          </div>
        </div>
      </div>

      <div className={styles.formFooter}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={saving}
        >
          취소
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={saving}
        >
          {saving ? (
            <>
              <Icon name="refresh" size="sm" />
              저장 중...
            </>
          ) : (
            '저장'
          )}
        </button>
      </div>
    </form>
  );
};

export default NavigationForm;