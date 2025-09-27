import React from "react";
import EntityFormPage, { type EntityFormConfig } from "./EntityFormPage";
import type { FormField } from "../../components/admin/EntityForm";

const SelfieReviewsFormPage: React.FC = () => {
  const fields: FormField[] = [
    {
      key: "patient_name",
      label: "환자명",
      type: "text",
      required: true,
      placeholder: "환자의 실명 또는 가명을 입력하세요",
      maxLength: 100,
    },
    {
      key: "patient_initial",
      label: "이니셜",
      type: "text",
      placeholder: "예: 김○○",
      maxLength: 20,
      validation: (value: string) => {
        if (!value) return undefined;

        // Basic Korean initial validation
        const koreanInitialRegex = /^[가-힣○●▲■◆]+$/;
        if (!koreanInitialRegex.test(value)) {
          return "한글 이니셜 형식으로 입력해주세요 (예: 김○○)";
        }

        return undefined;
      },
    },
    {
      key: "procedure_type",
      label: "시술 유형",
      type: "text",
      placeholder: "받은 시술명을 입력하세요",
      maxLength: 200,
    },
    {
      key: "selfie_url",
      label: "셀피 사진 URL",
      type: "url",
      required: true,
      placeholder: "https://example.com/selfie.jpg",
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
      key: "review_text",
      label: "리뷰 내용",
      type: "textarea",
      placeholder: "환자가 작성한 리뷰 내용을 입력하세요",
      rows: 6,
      maxLength: 2000,
    },
    {
      key: "rating",
      label: "평점 (1-5점)",
      type: "number",
      min: 1,
      max: 5,
      step: 1,
      placeholder: "1에서 5까지의 평점",
      validation: (value: number) => {
        if (!value) return undefined;
        if (value < 1 || value > 5) return "1점부터 5점까지 입력 가능합니다";
        if (!Number.isInteger(value)) return "정수로 입력해주세요";
        return undefined;
      },
    },
    {
      key: "patient_age_range",
      label: "연령대",
      type: "select",
      options: [
        { value: "10대", label: "10대" },
        { value: "20대", label: "20대" },
        { value: "30대", label: "30대" },
        { value: "40대", label: "40대" },
        { value: "50대", label: "50대" },
        { value: "60대+", label: "60대 이상" },
      ],
    },
    {
      key: "treatment_date",
      label: "치료일",
      type: "date",
      placeholder: "시술을 받은 날짜",
    },
    {
      key: "recovery_weeks",
      label: "회복 기간 (주)",
      type: "number",
      placeholder: "회복에 걸린 주 수",
      min: 0,
      max: 52,
      validation: (value: number) => {
        if (!value) return undefined;
        if (value < 0) return "0 이상이어야 합니다";
        if (value > 52) return "52주 이하여야 합니다";
        return undefined;
      },
    },
    {
      key: "tags",
      label: "태그",
      type: "tags",
      placeholder: "시술명, 부위, 특징 등 (쉼표로 구분)",
    },
    {
      key: "verified",
      label: "인증된 리뷰",
      type: "checkbox",
    },
    {
      key: "featured",
      label: "주요 리뷰로 표시",
      type: "checkbox",
    },
    {
      key: "consent_given",
      label: "동의서 작성 완료",
      type: "checkbox",
    },
    {
      key: "display_order",
      label: "표시 순서",
      type: "number",
      placeholder: "낮은 숫자가 먼저 표시됩니다",
      min: 0,
      max: 9999,
    },
    {
      key: "moderation_status",
      label: "승인 상태",
      type: "select",
      required: true,
      options: [
        { value: "pending", label: "대기중" },
        { value: "approved", label: "승인됨" },
        { value: "rejected", label: "거부됨" },
      ],
    },
    {
      key: "moderation_notes",
      label: "승인 메모",
      type: "textarea",
      placeholder: "승인/거부 사유나 기타 메모를 입력하세요",
      rows: 3,
      maxLength: 500,
    },
  ];

  const config: EntityFormConfig = {
    name: "Selfie Reviews",
    singularName: "Selfie Review",
    tableName: "selfie_reviews",
    fields,
    listPath: "/admin/selfie-reviews",
    defaultValues: {
      verified: false,
      featured: false,
      consent_given: false,
      display_order: 0,
      moderation_status: "pending",
      rating: 5, // Default to 5 stars
    },
  };

  return <EntityFormPage config={config} />;
};

export default SelfieReviewsFormPage;
