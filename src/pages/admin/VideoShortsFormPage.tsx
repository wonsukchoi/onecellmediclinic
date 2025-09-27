import React from "react";
import EntityFormPage, { type EntityFormConfig } from "./EntityFormPage";
import type { FormField } from "../../components/admin/EntityForm";

const VideoShortsFormPage: React.FC = () => {
  const fields: FormField[] = [
    {
      key: "title",
      label: "제목",
      type: "text",
      required: true,
      placeholder: "비디오 제목을 입력하세요",
      maxLength: 200,
    },
    {
      key: "video_url",
      label: "동영상 URL",
      type: "url",
      required: true,
      placeholder: "https://example.com/video.mp4",
      validation: (value: string) => {
        if (!value) return undefined;

        // Basic URL validation
        try {
          new URL(value);
        } catch {
          return "올바른 URL 형식이 아닙니다";
        }

        // Check for common video formats or platforms
        const isValidVideo =
          value.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
          value.includes("youtube.com") ||
          value.includes("youtu.be") ||
          value.includes("vimeo.com") ||
          value.includes("instagram.com") ||
          value.includes("tiktok.com");

        if (!isValidVideo) {
          return "지원하는 동영상 URL이 아닙니다";
        }

        return undefined;
      },
    },
    {
      key: "thumbnail_url",
      label: "썸네일 URL",
      type: "url",
      placeholder: "https://example.com/thumbnail.jpg (선택사항)",
      validation: (value: string) => {
        if (!value) return undefined;

        try {
          new URL(value);
        } catch {
          return "올바른 URL 형식이 아닙니다";
        }

        // const isImage = value.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        // if (!isImage) {
        //   return '이미지 파일 URL이어야 합니다 (jpg, png, gif, webp)';
        // }

        return undefined;
      },
    },
    {
      key: "description",
      label: "설명",
      type: "textarea",
      placeholder: "동영상에 대한 간단한 설명을 입력하세요",
      rows: 4,
      maxLength: 1000,
    },
    {
      key: "category",
      label: "카테고리",
      type: "select",
      required: true,
      options: [
        { value: "general", label: "일반" },
        { value: "procedure", label: "시술" },
        { value: "testimonial", label: "후기" },
        { value: "educational", label: "교육" },
        { value: "promotional", label: "홍보" },
      ],
    },
    {
      key: "duration_seconds",
      label: "재생 시간 (초)",
      type: "number",
      placeholder: "예: 30",
      min: 1,
      max: 3600, // 1 hour max
      validation: (value: number) => {
        if (!value) return undefined;
        if (value < 1) return "1초 이상이어야 합니다";
        if (value > 3600) return "1시간(3600초) 이하여야 합니다";
        return undefined;
      },
    },
    {
      key: "tags",
      label: "태그",
      type: "tags",
      placeholder: "피부관리, 리프팅, 보톡스 (쉼표로 구분)",
    },
    {
      key: "featured",
      label: "주요 콘텐츠로 표시",
      type: "checkbox",
    },
    {
      key: "active",
      label: "활성 상태",
      type: "checkbox",
    },
    {
      key: "order_index",
      label: "표시 순서",
      type: "number",
      placeholder: "낮은 숫자가 먼저 표시됩니다",
      min: 0,
      max: 9999,
    },
  ];

  const config: EntityFormConfig = {
    name: "Video Shorts",
    singularName: "Video Short",
    tableName: "video_shorts",
    fields,
    listPath: "/admin/video-shorts",
    defaultValues: {
      active: true,
      featured: false,
      order_index: 0,
      view_count: 0,
    },
  };

  return <EntityFormPage config={config} />;
};

export default VideoShortsFormPage;
