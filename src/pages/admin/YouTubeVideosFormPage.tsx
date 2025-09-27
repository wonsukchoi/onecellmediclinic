import React from 'react';
import EntityFormPage, { type EntityFormConfig } from './EntityFormPage';
import type { FormField } from '../../components/admin/EntityForm';

const YouTubeVideosFormPage: React.FC = () => {
  const fields: FormField[] = [
    {
      key: 'title',
      label: '제목',
      type: 'text',
      required: true,
      placeholder: '유튜브 동영상 제목을 입력하세요',
      maxLength: 200,
    },
    {
      key: 'youtube_id',
      label: '유튜브 ID',
      type: 'text',
      required: true,
      placeholder: 'dQw4w9WgXcQ (유튜브 URL에서 v= 뒤의 ID)',
      validation: (value: string) => {
        if (!value) return undefined;

        // YouTube ID validation (11 characters, alphanumeric and underscore/hyphen)
        const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
        if (!youtubeIdRegex.test(value)) {
          return '올바른 유튜브 ID 형식이 아닙니다 (11자리 영숫자)';
        }

        return undefined;
      },
    },
    {
      key: 'description',
      label: '설명',
      type: 'textarea',
      placeholder: '동영상에 대한 간단한 설명을 입력하세요',
      rows: 4,
      maxLength: 1000,
    },
    {
      key: 'category',
      label: '카테고리',
      type: 'select',
      required: true,
      options: [
        { value: 'general', label: '일반' },
        { value: 'procedure', label: '시술' },
        { value: 'testimonial', label: '후기' },
        { value: 'educational', label: '교육' },
        { value: 'promotional', label: '홍보' },
        { value: 'before-after', label: '전후 비교' },
        { value: 'tour', label: '클리닉 투어' },
        { value: 'interview', label: '인터뷰' },
      ],
    },
    {
      key: 'duration_seconds',
      label: '재생 시간 (초)',
      type: 'number',
      placeholder: '예: 180 (3분)',
      min: 1,
      max: 7200, // 2 hours max for YouTube
      validation: (value: number) => {
        if (!value) return undefined;
        if (value < 1) return '1초 이상이어야 합니다';
        if (value > 7200) return '2시간(7200초) 이하여야 합니다';
        return undefined;
      },
    },
    {
      key: 'tags',
      label: '태그',
      type: 'tags',
      placeholder: '피부관리, 리프팅, 보톡스, 유튜브 (쉼표로 구분)',
    },
    {
      key: 'featured',
      label: '주요 콘텐츠로 표시',
      type: 'checkbox',
    },
    {
      key: 'active',
      label: '활성 상태',
      type: 'checkbox',
    },
    {
      key: 'order_index',
      label: '표시 순서',
      type: 'number',
      placeholder: '낮은 숫자가 먼저 표시됩니다',
      min: 0,
      max: 9999,
    },
    {
      key: 'published_at',
      label: '게시일',
      type: 'datetime',
      placeholder: '게시할 날짜와 시간을 선택하세요',
    },
  ];

  const config: EntityFormConfig = {
    name: 'YouTube Videos',
    singularName: 'YouTube Video',
    tableName: 'youtube_videos',
    fields,
    listPath: '/admin/youtube-videos',
    defaultValues: {
      active: true,
      featured: false,
      order_index: 0,
      view_count: 0,
      published_at: new Date().toISOString().slice(0, 16), // Current datetime
    },
  };

  return <EntityFormPage config={config} />;
};

export default YouTubeVideosFormPage;