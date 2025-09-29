-- CMS Navigation Migration - Populate pages and navigation structure
-- Based on https://www.braunps.co.kr/ structure, adapted for 원셀의원 (One Cell Medical Clinic)
-- This migration creates comprehensive navigation and page structure for a medical clinic

BEGIN;

-- Clear existing navigation items (keeping core tables intact)
DELETE FROM header_navigation;
DELETE FROM page_blocks;
DELETE FROM dynamic_pages;

-- Main navigation structure based on braunps.co.kr
-- 1. 병원소개 (Hospital Introduction)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('병원소개', 'About Us', '/hospital', 'dropdown'::nav_type, 1, true);

-- Get parent ID for 병원소개
WITH hospital_parent AS (
    SELECT id FROM header_navigation WHERE label = '병원소개' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '원셀의원 소개', 'Clinic Introduction', '/hospital/about', 'link'::nav_type, hospital_parent.id, 1, true FROM hospital_parent
UNION ALL
SELECT '의료진 소개', 'Medical Staff', '/hospital/staff', 'link'::nav_type, hospital_parent.id, 2, true FROM hospital_parent
UNION ALL
SELECT '둘러보기', 'Clinic Tour', '/hospital/tour', 'link'::nav_type, hospital_parent.id, 3, true FROM hospital_parent
UNION ALL
SELECT '진료안내', 'Treatment Guide', '/hospital/guide', 'link'::nav_type, hospital_parent.id, 4, true FROM hospital_parent
ON CONFLICT DO NOTHING;

-- 2. 안면윤곽 (Facial Contour)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('안면윤곽', 'Facial Contour', '/facial-contour', 'dropdown'::nav_type, 2, true);

WITH facial_parent AS (
    SELECT id FROM header_navigation WHERE label = '안면윤곽' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '당기는 윤곽', 'Pulling Contour', '/facial-contour/pulling', 'link'::nav_type, facial_parent.id, 1, true FROM facial_parent
UNION ALL
SELECT '광대수술', 'Cheekbone Surgery', '/facial-contour/cheekbone', 'link'::nav_type, facial_parent.id, 2, true FROM facial_parent
UNION ALL
SELECT '사각턱수술', 'Square Jaw Surgery', '/facial-contour/square-jaw', 'link'::nav_type, facial_parent.id, 3, true FROM facial_parent
UNION ALL
SELECT '앞턱수술', 'Chin Surgery', '/facial-contour/front-chin', 'link'::nav_type, facial_parent.id, 4, true FROM facial_parent
UNION ALL
SELECT '윤곽 재수술', 'Contour Revision', '/facial-contour/revision', 'link'::nav_type, facial_parent.id, 5, true FROM facial_parent
ON CONFLICT DO NOTHING;

-- 3. 코 (Nose)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('코', 'Nose Surgery', '/nose', 'dropdown'::nav_type, 3, true);

WITH nose_parent AS (
    SELECT id FROM header_navigation WHERE label = '코' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '유형별 코성형', 'Rhinoplasty Types', '/nose/types', 'link'::nav_type, nose_parent.id, 1, true FROM nose_parent
UNION ALL
SELECT '기능코 성형', 'Functional Rhinoplasty', '/nose/functional', 'link'::nav_type, nose_parent.id, 2, true FROM nose_parent
UNION ALL
SELECT '코재수술', 'Nose Revision', '/nose/revision', 'link'::nav_type, nose_parent.id, 3, true FROM nose_parent
ON CONFLICT DO NOTHING;

-- 4. 눈 (Eyes)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('눈', 'Eye Surgery', '/eyes', 'dropdown'::nav_type, 4, true);

WITH eyes_parent AS (
    SELECT id FROM header_navigation WHERE label = '눈' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '유형별 눈성형', 'Blepharoplasty Types', '/eyes/types', 'link'::nav_type, eyes_parent.id, 1, true FROM eyes_parent
UNION ALL
SELECT '트임성형', 'Epicanthoplasty', '/eyes/epicanthoplasty', 'link'::nav_type, eyes_parent.id, 2, true FROM eyes_parent
UNION ALL
SELECT '안검하수 눈매교정', 'Ptosis Correction', '/eyes/ptosis', 'link'::nav_type, eyes_parent.id, 3, true FROM eyes_parent
UNION ALL
SELECT '눈밑성형', 'Under-eye Surgery', '/eyes/under-eye', 'link'::nav_type, eyes_parent.id, 4, true FROM eyes_parent
UNION ALL
SELECT '상/하안검', 'Upper/Lower Eyelid', '/eyes/upper-lower-lid', 'link'::nav_type, eyes_parent.id, 5, true FROM eyes_parent
UNION ALL
SELECT '내시경이마거상술', 'Endoscopic Forehead Lift', '/eyes/forehead-lift', 'link'::nav_type, eyes_parent.id, 6, true FROM eyes_parent
ON CONFLICT DO NOTHING;

-- 5. 리프팅 (Lifting)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('리프팅', 'Lifting', '/lifting', 'dropdown'::nav_type, 5, true);

WITH lifting_parent AS (
    SELECT id FROM header_navigation WHERE label = '리프팅' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '당기는 윤곽', 'Pulling Contour', '/lifting/pulling-contour', 'link'::nav_type, lifting_parent.id, 1, true FROM lifting_parent
UNION ALL
SELECT '안면거상', 'Facelift', '/lifting/facial', 'link'::nav_type, lifting_parent.id, 2, true FROM lifting_parent
UNION ALL
SELECT '목거상', 'Neck Lift', '/lifting/neck', 'link'::nav_type, lifting_parent.id, 3, true FROM lifting_parent
UNION ALL
SELECT '이마거상', 'Forehead Lift', '/lifting/forehead', 'link'::nav_type, lifting_parent.id, 4, true FROM lifting_parent
UNION ALL
SELECT '미니리프팅', 'Mini Lifting', '/lifting/mini', 'link'::nav_type, lifting_parent.id, 5, true FROM lifting_parent
UNION ALL
SELECT '실리프팅', 'Thread Lift', '/lifting/thread', 'link'::nav_type, lifting_parent.id, 6, true FROM lifting_parent
ON CONFLICT DO NOTHING;

-- 6. 남자성형 (Men's Surgery)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('남자성형', 'Men\'s Surgery', '/mens-surgery', 'link'::nav_type, 6, true);

-- 7. 가슴성형 (Breast Surgery)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('가슴성형', 'Breast Surgery', '/breast', 'dropdown'::nav_type, 7, true);

WITH breast_parent AS (
    SELECT id FROM header_navigation WHERE label = '가슴성형' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '가슴확대', 'Breast Augmentation', '/breast/augmentation', 'link'::nav_type, breast_parent.id, 1, true FROM breast_parent
UNION ALL
SELECT '처진가슴', 'Breast Lift', '/breast/sagging', 'link'::nav_type, breast_parent.id, 2, true FROM breast_parent
UNION ALL
SELECT '유두성형', 'Nipple Surgery', '/breast/nipple', 'link'::nav_type, breast_parent.id, 3, true FROM breast_parent
ON CONFLICT DO NOTHING;

-- 8. 체형성형 (Body Contouring)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('체형성형', 'Body Contouring', '/body', 'dropdown'::nav_type, 8, true);

WITH body_parent AS (
    SELECT id FROM header_navigation WHERE label = '체형성형' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '지방흡입', 'Liposuction', '/body/liposuction', 'link'::nav_type, body_parent.id, 1, true FROM body_parent
UNION ALL
SELECT '복부성형', 'Abdominoplasty', '/body/abdominoplasty', 'link'::nav_type, body_parent.id, 2, true FROM body_parent
ON CONFLICT DO NOTHING;

-- 9. 피부과 (Dermatology)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('피부과', 'Dermatology', '/dermatology', 'dropdown'::nav_type, 9, true);

WITH derma_parent AS (
    SELECT id FROM header_navigation WHERE label = '피부과' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '써마지', 'Thermage', '/dermatology/thermage', 'link'::nav_type, derma_parent.id, 1, true FROM derma_parent
UNION ALL
SELECT '울쎄라', 'Ulthera', '/dermatology/ulthera', 'link'::nav_type, derma_parent.id, 2, true FROM derma_parent
UNION ALL
SELECT '쥬베룩', 'Juvelook', '/dermatology/juvelook', 'link'::nav_type, derma_parent.id, 3, true FROM derma_parent
UNION ALL
SELECT '리쥬란', 'Rejuran', '/dermatology/rejuran', 'link'::nav_type, derma_parent.id, 4, true FROM derma_parent
UNION ALL
SELECT '입술필러', 'Lip Filler', '/dermatology/lip-filler', 'link'::nav_type, derma_parent.id, 5, true FROM derma_parent
UNION ALL
SELECT '레이저 안티에이징', 'Laser Anti-aging', '/dermatology/laser-antiaging', 'link'::nav_type, derma_parent.id, 6, true FROM derma_parent
UNION ALL
SELECT '스킨부스터', 'Skin Booster', '/dermatology/skin-booster', 'link'::nav_type, derma_parent.id, 7, true FROM derma_parent
UNION ALL
SELECT '필러/보톡스', 'Filler/Botox', '/dermatology/filler-botox', 'link'::nav_type, derma_parent.id, 8, true FROM derma_parent
ON CONFLICT DO NOTHING;

-- 10. 줄기세포 (Stem Cell)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('줄기세포', 'Stem Cell', '/stem-cell', 'link'::nav_type, 10, true);

-- 11. 후기 (Reviews)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('후기', 'Reviews', '/reviews', 'dropdown'::nav_type, 11, true);

WITH reviews_parent AS (
    SELECT id FROM header_navigation WHERE label = '후기' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '셀카후기', 'Selfie Reviews', '/reviews/selfie', 'link'::nav_type, reviews_parent.id, 1, true FROM reviews_parent
UNION ALL
SELECT '전후사진', 'Before & After', '/reviews/before-after', 'link'::nav_type, reviews_parent.id, 2, true FROM reviews_parent
UNION ALL
SELECT '수술후기', 'Surgery Reviews', '/reviews/surgery', 'link'::nav_type, reviews_parent.id, 3, true FROM reviews_parent
ON CONFLICT DO NOTHING;

-- 12. 예약문의 (Reservation & Inquiry)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('예약문의', 'Consultation', '/consultation', 'dropdown'::nav_type, 12, true);

WITH consult_parent AS (
    SELECT id FROM header_navigation WHERE label = '예약문의' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT '수술 전, 후 주의사항', 'Surgery Precautions', '/consultation/precautions', 'link'::nav_type, consult_parent.id, 1, true FROM consult_parent
UNION ALL
SELECT '온라인 예약', 'Online Reservation', '/reservation', 'link'::nav_type, consult_parent.id, 2, true FROM consult_parent
UNION ALL
SELECT '카톡상담', 'KakaoTalk Consultation', '/consultation/kakao', 'link'::nav_type, consult_parent.id, 3, true FROM consult_parent
ON CONFLICT DO NOTHING;

-- 13. 커뮤니티 (Community)
INSERT INTO header_navigation (label, label_en, url, nav_type, sort_order, is_visible) VALUES
('커뮤니티', 'Community', '/community', 'dropdown'::nav_type, 13, true);

WITH community_parent AS (
    SELECT id FROM header_navigation WHERE label = '커뮤니티' LIMIT 1
)
INSERT INTO header_navigation (label, label_en, url, nav_type, parent_id, sort_order, is_visible)
SELECT 'YOUTUBE', 'YouTube', '/community/youtube', 'link'::nav_type, community_parent.id, 1, true FROM community_parent
UNION ALL
SELECT '공지사항', 'Notice', '/community/notice', 'link'::nav_type, community_parent.id, 2, true FROM community_parent
UNION ALL
SELECT '이벤트', 'Events', '/events', 'link'::nav_type, community_parent.id, 3, true FROM community_parent
UNION ALL
SELECT '모델지원', 'Model Support', '/community/model-support', 'link'::nav_type, community_parent.id, 4, true FROM community_parent
UNION ALL
SELECT '회원가입', 'Sign Up', '/signup', 'link'::nav_type, community_parent.id, 5, true FROM community_parent
ON CONFLICT DO NOTHING;

-- Create dynamic pages for all navigation items
-- Hospital pages
INSERT INTO dynamic_pages (title, slug, description, meta_title, meta_description, status, template_id) VALUES
('원셀의원 소개', 'hospital/about', '원셀의원의 철학과 진료 방침을 소개합니다', '원셀의원 소개 | 원셀의원', '원셀의원의 의료진과 진료철학, 최신 의료장비를 소개합니다', 'published'::page_status, 'default'),
('의료진 소개', 'hospital/staff', '원셀의원의 전문 의료진을 소개합니다', '의료진 소개 | 원셀의원', '풍부한 경험과 전문성을 갖춘 원셀의원 의료진을 만나보세요', 'published'::page_status, 'default'),
('둘러보기', 'hospital/tour', '원셀의원 시설을 둘러보세요', '시설 둘러보기 | 원셀의원', '쾌적하고 안전한 원셀의원의 시설을 가상으로 둘러보세요', 'published'::page_status, 'gallery'),
('진료안내', 'hospital/guide', '원셀의원 진료 시간과 예약 안내', '진료안내 | 원셀의원', '원셀의원의 진료시간, 예약방법, 진료절차를 안내합니다', 'published'::page_status, 'default'),

-- Facial contour pages
('당기는 윤곽', 'facial-contour/pulling', '당기는 윤곽 시술 안내', '당기는 윤곽 | 원셀의원', '자연스럽고 효과적인 당기는 윤곽 시술을 소개합니다', 'published'::page_status, 'default'),
('광대수술', 'facial-contour/cheekbone', '광대수술 시술 안내', '광대수술 | 원셀의원', '안전하고 자연스러운 광대수술 정보를 제공합니다', 'published'::page_status, 'default'),
('사각턱수술', 'facial-contour/square-jaw', '사각턱수술 시술 안내', '사각턱수술 | 원셀의원', '개인별 맞춤 사각턱수술로 자연스러운 얼굴라인을 만들어드립니다', 'published'::page_status, 'default'),
('앞턱수술', 'facial-contour/front-chin', '앞턱수술 시술 안내', '앞턱수술 | 원셀의원', '균형잡힌 얼굴비율을 위한 앞턱수술을 안내합니다', 'published'::page_status, 'default'),
('윤곽 재수술', 'facial-contour/revision', '윤곽 재수술 안내', '윤곽 재수술 | 원셀의원', '윤곽 재수술 전문 클리닉, 안전하고 확실한 결과를 약속합니다', 'published'::page_status, 'default'),

-- Nose surgery pages
('유형별 코성형', 'nose/types', '다양한 코성형 유형 안내', '유형별 코성형 | 원셀의원', '개인의 얼굴형에 맞는 다양한 코성형 방법을 소개합니다', 'published'::page_status, 'default'),
('기능코 성형', 'nose/functional', '기능코 성형 안내', '기능코 성형 | 원셀의원', '호흡개선과 미용을 동시에 해결하는 기능코 성형입니다', 'published'::page_status, 'default'),
('코재수술', 'nose/revision', '코재수술 전문 클리닉', '코재수술 | 원셀의원', '코재수술 전문의가 안전하고 만족스러운 결과를 만들어드립니다', 'published'::page_status, 'default'),

-- Eye surgery pages
('유형별 눈성형', 'eyes/types', '다양한 눈성형 유형', '유형별 눈성형 | 원셀의원', '개인의 눈 모양에 맞는 맞춤 눈성형을 제공합니다', 'published'::page_status, 'default'),
('트임성형', 'eyes/epicanthoplasty', '트임성형 안내', '트임성형 | 원셀의원', '자연스럽고 또렷한 눈매를 위한 트임성형을 소개합니다', 'published'::page_status, 'default'),
('안검하수 눈매교정', 'eyes/ptosis', '안검하수 교정술', '안검하수 교정 | 원셀의원', '기능적, 미용적 개선을 위한 안검하수 교정술입니다', 'published'::page_status, 'default'),
('눈밑성형', 'eyes/under-eye', '눈밑성형 안내', '눈밑성형 | 원셀의원', '다크서클과 눈밑처짐을 개선하는 눈밑성형입니다', 'published'::page_status, 'default'),
('상/하안검', 'eyes/upper-lower-lid', '상하안검 수술', '상하안검 수술 | 원셀의원', '처진 눈꺼풀을 개선하는 상하안검 수술을 안내합니다', 'published'::page_status, 'default'),
('내시경이마거상술', 'eyes/forehead-lift', '내시경 이마거상술', '이마거상술 | 원셀의원', '최소절개로 진행하는 내시경 이마거상술입니다', 'published'::page_status, 'default'),

-- Lifting pages
('당기는 윤곽 리프팅', 'lifting/pulling-contour', '당기는 윤곽 리프팅', '당기는 윤곽 리프팅 | 원셀의원', '자연스러운 당기는 윤곽 리프팅으로 젊은 인상을 되찾으세요', 'published'::page_status, 'default'),
('안면거상', 'lifting/facial', '안면거상술 안내', '안면거상술 | 원셀의원', '처진 얼굴을 젊게 만드는 안면거상술을 소개합니다', 'published'::page_status, 'default'),
('목거상', 'lifting/neck', '목거상술 안내', '목거상술 | 원셀의원', '목선을 아름답게 만드는 목거상술입니다', 'published'::page_status, 'default'),
('이마거상', 'lifting/forehead', '이마거상술 안내', '이마거상술 | 원셀의원', '젊고 밝은 인상을 위한 이마거상술을 제공합니다', 'published'::page_status, 'default'),
('미니리프팅', 'lifting/mini', '미니리프팅 안내', '미니리프팅 | 원셀의원', '부담없는 미니리프팅으로 자연스러운 동안 효과를 경험하세요', 'published'::page_status, 'default'),
('실리프팅', 'lifting/thread', '실리프팅 안내', '실리프팅 | 원셀의원', '비수술 실리프팅으로 간편하게 리프팅 효과를 얻으세요', 'published'::page_status, 'default'),

-- Men's surgery
('남자성형', 'mens-surgery', '남성 전용 성형수술', '남자성형 | 원셀의원', '남성의 특성을 고려한 전문 성형수술을 제공합니다', 'published'::page_status, 'default'),

-- Breast surgery pages
('가슴확대', 'breast/augmentation', '가슴확대술 안내', '가슴확대 | 원셀의원', '자연스럽고 안전한 가슴확대술을 제공합니다', 'published'::page_status, 'default'),
('처진가슴', 'breast/sagging', '처진가슴 교정', '처진가슴 교정 | 원셀의원', '처진 가슴을 아름답게 교정하는 수술입니다', 'published'::page_status, 'default'),
('유두성형', 'breast/nipple', '유두성형 안내', '유두성형 | 원셀의원', '자연스럽고 아름다운 유두성형을 제공합니다', 'published'::page_status, 'default'),

-- Body contouring pages
('지방흡입', 'body/liposuction', '지방흡입술 안내', '지방흡입 | 원셀의원', '안전하고 효과적인 지방흡입으로 원하는 체형을 만들어드립니다', 'published'::page_status, 'default'),
('복부성형', 'body/abdominoplasty', '복부성형술 안내', '복부성형 | 원셀의원', '탄력있고 아름다운 복부라인을 만드는 복부성형술입니다', 'published'::page_status, 'default'),

-- Dermatology pages
('써마지', 'dermatology/thermage', '써마지 시술 안내', '써마지 | 원셀의원', '피부 탄력 개선을 위한 써마지 시술을 제공합니다', 'published'::page_status, 'default'),
('울쎄라', 'dermatology/ulthera', '울쎄라 시술 안내', '울쎄라 | 원셀의원', '비수술 리프팅 울쎄라로 젊은 피부를 되찾으세요', 'published'::page_status, 'default'),
('쥬베룩', 'dermatology/juvelook', '쥬베룩 시술 안내', '쥬베룩 | 원셀의원', '자연스러운 볼륨업과 리프팅 효과의 쥬베룩입니다', 'published'::page_status, 'default'),
('리쥬란', 'dermatology/rejuran', '리쥬란 시술 안내', '리쥬란 | 원셀의원', '피부 재생과 보습을 위한 리쥬란 시술입니다', 'published'::page_status, 'default'),
('입술필러', 'dermatology/lip-filler', '입술필러 시술 안내', '입술필러 | 원셀의원', '자연스럽고 매력적인 입술을 위한 입술필러입니다', 'published'::page_status, 'default'),
('레이저 안티에이징', 'dermatology/laser-antiaging', '레이저 안티에이징', '레이저 안티에이징 | 원셀의원', '다양한 레이저로 젊고 건강한 피부를 만들어드립니다', 'published'::page_status, 'default'),
('스킨부스터', 'dermatology/skin-booster', '스킨부스터 시술', '스킨부스터 | 원셀의원', '피부 수분과 탄력을 위한 스킨부스터 시술입니다', 'published'::page_status, 'default'),
('필러/보톡스', 'dermatology/filler-botox', '필러/보톡스 시술', '필러/보톡스 | 원셀의원', '자연스러운 주름 개선을 위한 필러/보톡스 시술입니다', 'published'::page_status, 'default'),

-- Stem cell
('줄기세포', 'stem-cell', '줄기세포 치료', '줄기세포 치료 | 원셀의원', '첨단 줄기세포 치료로 자연 치유력을 극대화합니다', 'published'::page_status, 'default'),

-- Reviews pages
('셀카후기', 'reviews/selfie', '셀카후기 갤러리', '셀카후기 | 원셀의원', '실제 고객들의 셀카후기를 확인해보세요', 'published'::page_status, 'gallery'),
('전후사진', 'reviews/before-after', '전후사진 갤러리', '전후사진 | 원셀의원', '수술 전후 비교사진으로 확인하는 실제 결과입니다', 'published'::page_status, 'gallery'),
('수술후기', 'reviews/surgery', '수술후기', '수술후기 | 원셀의원', '고객들의 생생한 수술 경험담을 들어보세요', 'published'::page_status, 'article'),

-- Consultation pages
('수술 전, 후 주의사항', 'consultation/precautions', '수술 주의사항', '수술 주의사항 | 원셀의원', '안전한 수술을 위한 수술 전후 주의사항을 안내합니다', 'published'::page_status, 'default'),
('카톡상담', 'consultation/kakao', '카카오톡 상담', '카톡상담 | 원셀의원', '카카오톡을 통한 간편하고 빠른 상담 서비스입니다', 'published'::page_status, 'default'),

-- Community pages
('YOUTUBE', 'community/youtube', 'YouTube 채널', 'YouTube | 원셀의원', '원셀의원의 다양한 정보를 YouTube에서 만나보세요', 'published'::page_status, 'default'),
('공지사항', 'community/notice', '공지사항', '공지사항 | 원셀의원', '원셀의원의 최신 소식과 공지사항을 확인하세요', 'published'::page_status, 'article'),
('모델지원', 'community/model-support', '모델지원 프로그램', '모델지원 | 원셀의원', '원셀의원의 모델지원 프로그램에 참여해보세요', 'published'::page_status, 'default')
ON CONFLICT (slug) DO NOTHING;

-- Create sample page blocks for key pages
-- Hospital about page blocks
WITH about_page AS (
    SELECT id FROM dynamic_pages WHERE slug = 'hospital/about' LIMIT 1
)
INSERT INTO page_blocks (page_id, block_type, title, content, sort_order, is_visible)
SELECT about_page.id, 'text'::block_type, '원셀의원을 소개합니다',
    '{"html": "<h2>원셀의원의 철학</h2><p>원셀의원은 개인별 맞춤 치료를 통해 자연스럽고 아름다운 결과를 추구합니다. 풍부한 경험과 최신 의료기술로 안전하고 만족스러운 치료를 제공합니다.</p>"}'::jsonb,
    1, true FROM about_page
UNION ALL
SELECT about_page.id, 'image'::block_type, '병원 내부 전경',
    '{"src": "/images/hospital-interior.jpg", "alt": "원셀의원 내부 전경", "caption": "쾌적하고 안전한 진료 환경"}'::jsonb,
    2, true FROM about_page
ON CONFLICT DO NOTHING;

-- Staff page blocks
WITH staff_page AS (
    SELECT id FROM dynamic_pages WHERE slug = 'hospital/staff' LIMIT 1
)
INSERT INTO page_blocks (page_id, block_type, title, content, sort_order, is_visible)
SELECT staff_page.id, 'text'::block_type, '전문 의료진',
    '{"html": "<h2>경험과 실력을 갖춘 의료진</h2><p>원셀의원의 의료진은 풍부한 임상경험과 지속적인 연구를 통해 최고의 의료서비스를 제공합니다.</p>"}'::jsonb,
    1, true FROM staff_page
ON CONFLICT DO NOTHING;

-- Facial contour page blocks
WITH facial_page AS (
    SELECT id FROM dynamic_pages WHERE slug = 'facial-contour/pulling' LIMIT 1
)
INSERT INTO page_blocks (page_id, block_type, title, content, sort_order, is_visible)
SELECT facial_page.id, 'text'::block_type, '당기는 윤곽이란?',
    '{"html": "<h2>자연스러운 당기는 윤곽</h2><p>당기는 윤곽은 개인의 얼굴형에 맞춘 맞춤형 윤곽 시술로, 자연스럽고 아름다운 얼굴라인을 만들어드립니다.</p>"}'::jsonb,
    1, true FROM facial_page
UNION ALL
SELECT facial_page.id, 'cta'::block_type, '상담 예약하기',
    '{"text": "당기는 윤곽 상담받기", "url": "/reservation", "style": "primary"}'::jsonb,
    2, true FROM facial_page
ON CONFLICT DO NOTHING;

COMMIT;