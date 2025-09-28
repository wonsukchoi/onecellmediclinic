import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CMSService } from '../../services/cms.service';
import type {
  PageFormData,
  PageTemplate,
  PageBlock,
  PageStatus,
  BlockFormData
} from '../../types';
import { Icon } from '../../components/icons';
import PageBlockManager from '../../components/admin/cms/PageBlockManager';
import styles from './DynamicPageFormPage.module.css';

const DynamicPageFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  const [loading, setLoading] = useState(!!id || !!duplicateId);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [slugGenerated, setSlugGenerated] = useState(true);

  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    description: '',
    keywords: '',
    meta_title: '',
    meta_description: '',
    template_id: '',
    status: 'draft',
    featured_image: '',
    seo_canonical_url: '',
    seo_og_image: '',
    custom_css: '',
    custom_js: '',
  });

  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'blocks' | 'advanced'>('basic');

  const isEditing = !!id;
  const isDuplicating = !!duplicateId;

  const loadTemplates = useCallback(async () => {
    try {
      const result = await CMSService.getTemplates();
      if (result.success && result.data) {
        setTemplates(result.data);
        if (result.data.length > 0 && !formData.template_id) {
          setFormData(prev => ({ ...prev, template_id: result.data![0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }, [formData.template_id]);

  const loadPage = useCallback(async (pageId: string) => {
    try {
      setLoading(true);
      const result = await CMSService.getPageById(pageId);

      if (result.success && result.data) {
        const page = result.data;

        setFormData({
          title: isDuplicating ? `${page.title} (복사본)` : page.title,
          slug: isDuplicating ? '' : page.slug,
          description: page.description || '',
          keywords: page.keywords || '',
          meta_title: page.meta_title || '',
          meta_description: page.meta_description || '',
          template_id: page.template_id,
          status: isDuplicating ? 'draft' : page.status,
          featured_image: page.featured_image || '',
          seo_canonical_url: page.seo_canonical_url || '',
          seo_og_image: page.seo_og_image || '',
          custom_css: page.custom_css || '',
          custom_js: page.custom_js || '',
        });

        if (page.blocks) {
          setBlocks(page.blocks);
        }

        if (isDuplicating) {
          setSlugGenerated(true);
        } else {
          setSlugGenerated(false);
        }
      } else {
        setError(result.error || '페이지 데이터를 불러올 수 없습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    } finally {
      setLoading(false);
    }
  }, [isDuplicating]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  useEffect(() => {
    if (id) {
      loadPage(id);
    } else if (duplicateId) {
      loadPage(duplicateId);
    } else {
      setLoading(false);
    }
  }, [id, duplicateId, loadPage]);

  const generateSlug = (title: string): string => {
    return CMSService.generateSlug(title);
  };

  const handleInputChange = (field: keyof PageFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === 'title' && slugGenerated) {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({ ...prev, slug: value }));
    setSlugGenerated(false);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요');
      return false;
    }

    if (!formData.slug.trim()) {
      setError('슬러그를 입력해주세요');
      return false;
    }

    if (!formData.template_id) {
      setError('템플릿을 선택해주세요');
      return false;
    }

    return true;
  };

  const validateSlug = async (): Promise<boolean> => {
    const isValid = await CMSService.validateSlug(formData.slug, isEditing ? id : undefined);
    if (!isValid) {
      setError('이미 사용중인 슬러그입니다');
      return false;
    }
    return true;
  };

  const handleSave = async (status?: PageStatus) => {
    if (!validateForm()) {
      return;
    }

    if (!(await validateSlug())) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const saveData = {
        ...formData,
        status: status || formData.status,
      };

      let result;
      if (isEditing && !isDuplicating) {
        result = await CMSService.updatePage(id!, saveData);
      } else {
        result = await CMSService.createPage(saveData);
      }

      if (result.success && result.data) {
        // Save blocks if this is a new page or duplicate
        if ((!isEditing || isDuplicating) && blocks.length > 0) {
          const blockPromises = blocks.map((block, index) => {
            const blockData: BlockFormData = {
              block_type: block.block_type,
              title: block.title,
              content: block.content,
              styles: block.styles,
              sort_order: index + 1,
              is_visible: block.is_visible,
            };
            return CMSService.createBlock(result.data!.id, blockData);
          });

          await Promise.all(blockPromises);
        }

        navigate('/admin/cms/pages');
      } else {
        setError(result.error || '페이지 저장에 실패했습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류입니다');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/cms/pages');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Icon name="refresh" size="lg" />
        <span>페이지 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className={styles.formPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <button
            onClick={handleCancel}
            className={styles.backButton}
          >
            <Icon name="arrowLeft" size="sm" />
            페이지 목록으로
          </button>
          <h1 className={styles.pageTitle}>
            {isEditing && !isDuplicating ? '페이지 수정' : '새 페이지 추가'}
          </h1>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}
        </div>
        <div className={styles.headerRight}>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className={styles.draftButton}
          >
            {saving ? <Icon name="refresh" size="sm" /> : null}
            초안 저장
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className={styles.publishButton}
          >
            {saving ? <Icon name="refresh" size="sm" /> : null}
            게시
          </button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.tabNav}>
          <button
            onClick={() => setActiveTab('basic')}
            className={`${styles.tabButton} ${activeTab === 'basic' ? styles.active : ''}`}
          >
            기본 정보
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`${styles.tabButton} ${activeTab === 'seo' ? styles.active : ''}`}
          >
            SEO 설정
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`${styles.tabButton} ${activeTab === 'blocks' ? styles.active : ''}`}
          >
            콘텐츠 블록
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`${styles.tabButton} ${activeTab === 'advanced' ? styles.active : ''}`}
          >
            고급 설정
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'basic' && (
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    제목 <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={styles.input}
                    placeholder="페이지 제목을 입력하세요"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    슬러그 <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.slugContainer}>
                    <span className={styles.slugPrefix}>/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={styles.slugInput}
                      placeholder="page-url"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSlug = generateSlug(formData.title);
                        setFormData(prev => ({ ...prev, slug: newSlug }));
                        setSlugGenerated(true);
                      }}
                      className={styles.generateSlugButton}
                      title="제목에서 슬러그 생성"
                    >
                      <Icon name="refresh" size="sm" />
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>설명</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={styles.textarea}
                    placeholder="페이지에 대한 간단한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>키워드</label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                    className={styles.input}
                    placeholder="쉼표로 구분된 키워드"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    템플릿 <span className={styles.required}>*</span>
                  </label>
                  <select
                    value={formData.template_id}
                    onChange={(e) => handleInputChange('template_id', e.target.value)}
                    className={styles.select}
                  >
                    <option value="">템플릿을 선택하세요</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>대표 이미지</label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => handleInputChange('featured_image', e.target.value)}
                    className={styles.input}
                    placeholder="이미지 URL을 입력하세요"
                  />
                  {formData.featured_image && (
                    <div className={styles.imagePreview}>
                      <img
                        src={formData.featured_image}
                        alt="대표 이미지 미리보기"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>상태</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={styles.select}
                  >
                    <option value="draft">초안</option>
                    <option value="published">게시됨</option>
                    <option value="archived">보관됨</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>메타 제목</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => handleInputChange('meta_title', e.target.value)}
                    className={styles.input}
                    placeholder="검색 결과에 표시될 제목"
                    maxLength={60}
                  />
                  <div className={styles.charCount}>
                    {formData.meta_title?.length || 0}/60
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>메타 설명</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => handleInputChange('meta_description', e.target.value)}
                    className={styles.textarea}
                    placeholder="검색 결과에 표시될 설명"
                    rows={3}
                    maxLength={160}
                  />
                  <div className={styles.charCount}>
                    {formData.meta_description?.length || 0}/160
                  </div>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Canonical URL</label>
                  <input
                    type="url"
                    value={formData.seo_canonical_url}
                    onChange={(e) => handleInputChange('seo_canonical_url', e.target.value)}
                    className={styles.input}
                    placeholder="https://example.com/canonical-url"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>OG 이미지</label>
                  <input
                    type="url"
                    value={formData.seo_og_image}
                    onChange={(e) => handleInputChange('seo_og_image', e.target.value)}
                    className={styles.input}
                    placeholder="소셜 미디어 공유용 이미지 URL"
                  />
                  {formData.seo_og_image && (
                    <div className={styles.imagePreview}>
                      <img
                        src={formData.seo_og_image}
                        alt="OG 이미지 미리보기"
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'blocks' && (
            <div className={styles.formSection}>
              {isEditing && !isDuplicating ? (
                <PageBlockManager pageId={id!} />
              ) : (
                <div className={styles.blocksPlaceholder}>
                  <Icon name="warning" size="lg" />
                  <p>페이지를 먼저 저장한 후 콘텐츠 블록을 관리할 수 있습니다.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className={styles.formSection}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>커스텀 CSS</label>
                  <textarea
                    value={formData.custom_css}
                    onChange={(e) => handleInputChange('custom_css', e.target.value)}
                    className={`${styles.textarea} ${styles.codeTextarea}`}
                    placeholder="/* 이 페이지에만 적용될 CSS 코드를 입력하세요 */"
                    rows={8}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>커스텀 JavaScript</label>
                  <textarea
                    value={formData.custom_js}
                    onChange={(e) => handleInputChange('custom_js', e.target.value)}
                    className={`${styles.textarea} ${styles.codeTextarea}`}
                    placeholder="// 이 페이지에만 적용될 JavaScript 코드를 입력하세요"
                    rows={8}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicPageFormPage;