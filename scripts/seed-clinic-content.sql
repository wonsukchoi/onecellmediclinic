-- ===============================================
-- OneCell Medical Clinic - Content Seed Data
-- ===============================================
-- Content inspired by medical clinic website structure
-- All brand references removed, using generic medical clinic content
-- ===============================================

-- Clean existing data for fresh import
DELETE FROM selfie_reviews;
DELETE FROM youtube_videos;
DELETE FROM video_shorts;
DELETE FROM clinic_features;
DELETE FROM differentiators;
DELETE FROM gallery_items;
DELETE FROM procedures;
DELETE FROM procedure_categories;
DELETE FROM providers;
DELETE FROM event_banners;

-- ===============================================
-- PROCEDURE CATEGORIES
-- ===============================================
INSERT INTO procedure_categories (name, description, icon_name, display_order, active) VALUES
('안면윤곽', '얼굴 라인을 개선하고 균형잡힌 얼굴형을 만드는 수술', 'face', 1, true),
('코성형', '개인의 얼굴에 어울리는 아름답고 자연스러운 코를 만드는 수술', 'nose', 2, true),
('눈성형', '맑고 또렷한 눈매를 만들어 인상을 개선하는 수술', 'eye', 3, true),
('리프팅', '처진 피부와 주름을 개선하여 젊고 탄력있는 얼굴을 만드는 시술', 'lifting', 4, true),
('남성성형', '남성의 특성을 고려한 자연스럽고 남성적인 이미지 개선', 'male', 5, true),
('가슴성형', '아름답고 자연스러운 가슴 라인을 만드는 수술', 'chest', 6, true),
('체형성형', '균형잡힌 바디라인을 만드는 체형 교정 수술', 'body', 7, true),
('피부과', '피부 건강과 아름다움을 위한 비수술적 시술', 'skin', 8, true),
('줄기세포', '첨단 줄기세포 기술을 활용한 재생 치료', 'cell', 9, true);

-- ===============================================
-- PROCEDURES (시술/수술 목록)
-- ===============================================

-- 안면윤곽 수술
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='안면윤곽'), '안면 윤곽 재수술', 'facial-contouring-revision', '이전 수술 결과를 개선하는 재수술', '첫 수술 후 불만족스러운 결과나 부작용을 교정하는 전문적인 재수술입니다. 3D CT 정밀 분석을 통해 안전하게 진행합니다.', 240, '상담 후 결정', '4-6주', true, 1),
((SELECT id FROM procedure_categories WHERE name='안면윤곽'), '광대뼈 축소술', 'cheekbone-reduction', '돌출된 광대뼈를 자연스럽게 축소', '45도 광대와 옆광대를 동시에 개선하여 부드러운 얼굴 라인을 만듭니다. 최소절개로 흉터를 최소화합니다.', 180, '400-600만원', '2-3주', true, 2),
((SELECT id FROM procedure_categories WHERE name='안면윤곽'), '사각턱 수술', 'square-jaw-surgery', '각진 턱선을 부드럽게 교정', '과도하게 발달한 하악각을 절제하여 갸름한 V라인을 만듭니다. 신경 손상을 최소화하는 안전한 수술법을 사용합니다.', 150, '350-500만원', '2-3주', true, 3),
((SELECT id FROM procedure_categories WHERE name='안면윤곽'), '턱끝 성형', 'chin-surgery', '턱끝 모양과 길이를 개선', '무턱, 긴턱, 짧은턱 등 다양한 턱 고민을 해결합니다. T절골술, 보형물 삽입 등 개인별 맞춤 수술을 진행합니다.', 120, '250-400만원', '2주', true, 4);

-- 코성형
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='코성형'), '맞춤형 코성형', 'custom-rhinoplasty', '개인 얼굴형에 어울리는 맞춤 코성형', '얼굴 비율과 개인의 취향을 고려한 1:1 맞춤 디자인으로 자연스럽고 조화로운 코를 만듭니다.', 180, '300-500만원', '1-2주', true, 1),
((SELECT id FROM procedure_categories WHERE name='코성형'), '기능코 성형', 'functional-rhinoplasty', '미용과 기능을 동시에 개선', '비중격만곡증, 비염 등 기능적 문제를 해결하면서 동시에 미용적 개선을 도모합니다.', 210, '400-600만원', '2주', true, 2),
((SELECT id FROM procedure_categories WHERE name='코성형'), '코 재수술', 'rhinoplasty-revision', '불만족스러운 결과 개선', '이전 수술의 부작용이나 불만족스러운 결과를 개선하는 고난도 재수술입니다.', 240, '500-800만원', '2-3주', true, 3);

-- 눈성형
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='눈성형'), '눈매 교정', 'eye-shape-correction', '개인별 맞춤 눈매 디자인', '쌍꺼풀 라인, 눈 크기, 눈매 방향을 종합적으로 개선하여 또렷하고 매력적인 눈을 만듭니다.', 90, '150-250만원', '1주', true, 1),
((SELECT id FROM procedure_categories WHERE name='눈성형'), '눈꺼풀 수술', 'eyelid-surgery', '처진 눈꺼풀 개선', '노화로 처진 눈꺼풀을 개선하여 젊고 시원한 눈매를 만듭니다.', 120, '200-300만원', '1-2주', true, 2),
((SELECT id FROM procedure_categories WHERE name='눈성형'), '안검하수 교정', 'ptosis-correction', '졸린 눈 개선', '눈꺼풀을 올리는 근육을 강화하여 또렷하고 큰 눈을 만듭니다.', 90, '180-280만원', '1주', true, 3),
((SELECT id FROM procedure_categories WHERE name='눈성형'), '눈밑지방 재배치', 'under-eye-surgery', '다크서클과 눈밑 지방 개선', '튀어나온 눈밑 지방을 재배치하여 다크서클을 개선하고 젊은 인상을 만듭니다.', 60, '150-250만원', '1주', true, 4),
((SELECT id FROM procedure_categories WHERE name='눈성형'), '내시경 이마거상술', 'endoscopic-forehead-lift', '이마 주름과 처진 눈꺼풀 개선', '최소절개 내시경을 이용하여 이마 주름과 처진 눈썹을 동시에 개선합니다.', 180, '300-450만원', '2주', true, 5);

-- 리프팅
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='리프팅'), '안면 리프팅', 'face-lifting', '처진 얼굴 전체 리프팅', 'SMAS층까지 당겨주는 근본적인 리프팅으로 10년 이상 젊어지는 효과를 제공합니다.', 240, '600-1000만원', '2-3주', true, 1),
((SELECT id FROM procedure_categories WHERE name='리프팅'), '목 리프팅', 'neck-lifting', '처진 목과 목주름 개선', '목의 처진 피부와 깊은 주름을 개선하여 젊은 목선을 만듭니다.', 180, '400-600만원', '2주', true, 2),
((SELECT id FROM procedure_categories WHERE name='리프팅'), '이마 리프팅', 'forehead-lifting', '이마 주름과 처진 눈썹 개선', '깊은 이마 주름을 제거하고 처진 눈썹을 올려 젊은 인상을 만듭니다.', 150, '300-500만원', '2주', true, 3),
((SELECT id FROM procedure_categories WHERE name='리프팅'), '미니 리프팅', 'mini-lifting', '부분적인 처짐 개선', '특정 부위만 집중적으로 개선하는 부담 없는 리프팅입니다.', 120, '200-400만원', '1주', true, 4),
((SELECT id FROM procedure_categories WHERE name='리프팅'), '실 리프팅', 'thread-lifting', '비수술 리프팅', '녹는 실을 이용한 간단한 시술로 즉각적인 리프팅 효과를 제공합니다.', 60, '100-200만원', '3일', true, 5);

-- 남성성형
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='남성성형'), '남성 안면윤곽', 'male-facial-contouring', '남성적인 턱선 만들기', '각진 턱선과 강한 인상을 유지하면서 과도한 부분만 개선합니다.', 180, '400-600만원', '2-3주', true, 1),
((SELECT id FROM procedure_categories WHERE name='남성성형'), '남성 코성형', 'male-rhinoplasty', '남성적인 코라인', '곧고 시원한 남성적 코라인을 만들어 신뢰감 있는 인상을 완성합니다.', 150, '300-500만원', '1-2주', true, 2),
((SELECT id FROM procedure_categories WHERE name='남성성형'), '남성 눈성형', 'male-eye-surgery', '또렷한 남성 눈매', '자연스럽고 남성적인 눈매를 만들어 카리스마 있는 인상을 완성합니다.', 90, '150-250만원', '1주', true, 3);

-- 가슴성형
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='가슴성형'), '가슴 확대술', 'breast-augmentation', '자연스러운 가슴 확대', '개인의 체형에 맞는 보형물 선택과 정밀한 수술로 자연스러운 가슴을 만듭니다.', 120, '600-900만원', '1-2주', true, 1),
((SELECT id FROM procedure_categories WHERE name='가슴성형'), '처진가슴 교정', 'breast-ptosis-correction', '처진 가슴 리프팅', '임신, 수유, 노화로 처진 가슴을 탄력있게 교정합니다.', 180, '500-700만원', '2주', true, 2),
((SELECT id FROM procedure_categories WHERE name='가슴성형'), '유두 유륜 성형', 'nipple-surgery', '유두 유륜 크기와 모양 개선', '크거나 함몰된 유두, 넓은 유륜을 개선하여 균형잡힌 가슴을 만듭니다.', 60, '150-250만원', '1주', true, 3);

-- 체형성형
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='체형성형'), '지방흡입', 'liposuction', '국소부위 지방 제거', '운동과 식이요법으로 해결되지 않는 국소 지방을 효과적으로 제거합니다.', 120, '부위당 150-300만원', '1-2주', true, 1),
((SELECT id FROM procedure_categories WHERE name='체형성형'), '복부성형', 'abdominoplasty', '늘어진 복부 피부 제거', '임신이나 급격한 체중감량 후 늘어진 복부 피부를 제거하고 탄력있는 복부를 만듭니다.', 180, '400-600만원', '2-3주', true, 2);

-- 피부과 시술
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='피부과'), '써마지', 'thermage', '고주파 리프팅', '고주파 에너지로 콜라겐 재생을 촉진하여 탄력있는 피부를 만듭니다.', 60, '200-400만원', '즉시 일상생활', true, 1),
((SELECT id FROM procedure_categories WHERE name='피부과'), '울쎄라', 'ulthera', '초음파 리프팅', 'HIFU 초음파로 SMAS층까지 작용하여 강력한 리프팅 효과를 제공합니다.', 90, '250-450만원', '즉시 일상생활', true, 2),
((SELECT id FROM procedure_categories WHERE name='피부과'), '쥬베룩', 'juvelook', '콜라겐 부스터', 'PDLLA 성분으로 자연스러운 볼륨과 탄력을 만듭니다.', 30, '80-150만원', '즉시 일상생활', true, 3),
((SELECT id FROM procedure_categories WHERE name='피부과'), '리쥬란', 'rejuran', '연어 DNA 주사', '연어 DNA로 피부 재생을 촉진하고 잔주름을 개선합니다.', 30, '40-80만원', '즉시 일상생활', true, 4),
((SELECT id FROM procedure_categories WHERE name='피부과'), '입술필러', 'lip-filler', '볼륨있는 입술', '자연스럽고 볼륨있는 입술을 만들어 젊고 생기있는 인상을 완성합니다.', 20, '30-60만원', '즉시 일상생활', true, 5),
((SELECT id FROM procedure_categories WHERE name='피부과'), '레이저 안티에이징', 'laser-antiaging', '피부 재생 레이저', '프락셔널 레이저로 피부 톤과 질감을 개선합니다.', 45, '회당 30-50만원', '3-5일', true, 6),
((SELECT id FROM procedure_categories WHERE name='피부과'), '스킨부스터', 'skin-booster', '수분 광채 주사', '히알루론산으로 피부 깊숙이 수분을 공급하여 촉촉하고 빛나는 피부를 만듭니다.', 30, '40-80만원', '즉시 일상생활', true, 7),
((SELECT id FROM procedure_categories WHERE name='피부과'), '필러/보톡스', 'filler-botox', '주름 개선 시술', '보톡스와 필러로 주름을 개선하고 젊은 인상을 만듭니다.', 30, '부위당 20-100만원', '즉시 일상생활', true, 8);

-- 줄기세포
INSERT INTO procedures (category_id, name, slug, description, detailed_description, duration_minutes, price_range, recovery_time, active, display_order) VALUES
((SELECT id FROM procedure_categories WHERE name='줄기세포'), '줄기세포 치료', 'stem-cell-therapy', '재생의학 치료', '자가 줄기세포를 이용한 안티에이징과 재생 치료입니다.', 120, '상담 후 결정', '1주', true, 1);

-- ===============================================
-- PROVIDERS (의료진)
-- ===============================================
INSERT INTO providers (full_name, title, specialization, bio, years_experience, education, certifications, languages, active) VALUES
('김원장', '대표원장', '안면윤곽, 코성형', '15년 이상의 풍부한 수술 경험과 끊임없는 연구로 자연스럽고 아름다운 결과를 추구합니다.', 15,
ARRAY['서울대학교 의과대학 졸업', '서울대학교병원 성형외과 전문의', '미국 성형외과학회 정회원'],
ARRAY['대한성형외과학회 정회원', '대한미용성형외과학회 정회원', '국제성형외과학회 정회원'],
ARRAY['한국어', 'English'], true),

('이원장', '성형외과 전문의', '눈성형, 안면성형', '섬세한 수술과 미적 감각으로 개인별 맞춤 성형을 제공합니다.', 12,
ARRAY['연세대학교 의과대학 졸업', '세브란스병원 성형외과 전문의'],
ARRAY['대한성형외과학회 정회원', '대한레이저의학회 정회원'],
ARRAY['한국어', 'English'], true),

('박원장', '성형외과 전문의', '가슴성형, 체형성형', '안전을 최우선으로 하는 수술 철학과 자연스러운 결과를 추구합니다.', 10,
ARRAY['가톨릭대학교 의과대학 졸업', '강남성모병원 성형외과 전문의'],
ARRAY['대한성형외과학회 정회원', '대한지방성형학회 정회원'],
ARRAY['한국어'], true),

('최원장', '피부과 전문의', '피부 레이저, 안티에이징', '최신 피부과 시술로 건강하고 아름다운 피부를 만듭니다.', 8,
ARRAY['고려대학교 의과대학 졸업', '고려대학교병원 피부과 전문의'],
ARRAY['대한피부과학회 정회원', '대한레이저의학회 정회원'],
ARRAY['한국어', 'English', '中文'], true);

-- ===============================================
-- CLINIC FEATURES (클리닉 특징)
-- ===============================================
INSERT INTO clinic_features (title, description, icon_url, category, stats_number, stats_label, order_index, active) VALUES
('연구 중심 접근', '끊임없는 연구와 학술활동을 통해 최신 의학 지식을 임상에 적용합니다', '/icons/research.svg', 'expertise', '100+', '학술논문', 1, true),
('투명한 수술 과정', '수술 전 과정을 투명하게 공개하고 환자와 충분히 소통합니다', '/icons/transparency.svg', 'trust', '100%', '정보공개', 2, true),
('수술 전 건강검진', '안전한 수술을 위해 체계적인 사전 건강검진을 실시합니다', '/icons/health-check.svg', 'safety', '15+', '검사항목', 3, true),
('안전 중심 시스템', '응급상황 대비 시스템과 철저한 감염관리로 안전을 보장합니다', '/icons/safety.svg', 'safety', '24/7', '안전관리', 4, true),
('대리수술 없음', '담당 의사가 처음부터 끝까지 직접 수술을 집도합니다', '/icons/no-proxy.svg', 'trust', '0%', '대리수술', 5, true),
('마취 관리 시스템', '마취과 전문의 상주로 안전한 마취와 수술을 보장합니다', '/icons/anesthesia.svg', 'safety', '전문의', '상주', 6, true),
('수술 결과 기록', '모든 수술 결과를 체계적으로 기록하고 관리합니다', '/icons/documentation.svg', 'quality', '10년+', '경과관찰', 7, true),
('1:1 맞춤 상담', '충분한 시간을 할애하여 개인별 맞춤 상담을 제공합니다', '/icons/consultation.svg', 'service', '60분+', '상담시간', 8, true),
('최신 의료 장비', '최첨단 의료 장비로 정확한 진단과 안전한 수술을 제공합니다', '/icons/equipment.svg', 'technology', '2024년', '최신장비', 9, true),
('감염 관리 시스템', '병원 전체 공기정화 시스템과 무균 수술실 운영', '/icons/infection-control.svg', 'safety', 'HEPA', '공기정화', 10, true),
('사후관리 프로그램', '수술 후에도 지속적인 관리로 최상의 결과를 유지합니다', '/icons/aftercare.svg', 'service', '평생', '사후관리', 11, true),
('응급대응 체계', '응급상황 발생시 신속한 대응이 가능한 시스템 구축', '/icons/emergency.svg', 'safety', '3분', '응급대응', 12, true);

-- ===============================================
-- DIFFERENTIATORS (차별화 요소)
-- ===============================================
INSERT INTO differentiators (title, subtitle, description, icon, stats_number, stats_label, background_color, text_color, order_index, active) VALUES
('안전 최우선', '환자 안전이 최우선입니다', '철저한 사전 검사, 마취과 전문의 상주, 응급 대응 시스템으로 안전을 보장합니다', 'shield', '0', '의료사고', '#f0fdf4', '#166534', 1, true),
('풍부한 경험', '15년 이상의 노하우', '수많은 케이스 경험과 지속적인 연구로 최상의 결과를 제공합니다', 'award', '10,000+', '수술케이스', '#eff6ff', '#1d4ed8', 2, true),
('정직한 상담', '과잉진료 없는 정직한 상담', '필요한 수술만 권하고 충분한 설명으로 신뢰를 쌓습니다', 'handshake', '100%', '정직상담', '#fef3c7', '#d97706', 3, true),
('맞춤형 디자인', '개인별 특성 고려', '얼굴형, 체형, 라이프스타일을 고려한 1:1 맞춤 디자인', 'user', '1:1', '맞춤설계', '#fce7f3', '#a21caf', 4, true),
('최신 기술 도입', '끊임없는 기술 혁신', '최신 수술 기법과 장비 도입으로 더 나은 결과를 추구합니다', 'innovation', '2024', '최신기술', '#e0e7ff', '#4338ca', 5, true),
('평생 책임 관리', '수술 후에도 계속되는 관리', '정기 검진과 지속적인 관리로 평생 아름다움을 유지합니다', 'heart', '평생', '책임관리', '#fee2e2', '#991b1b', 6, true);

-- ===============================================
-- VIDEO SHORTS (비디오 쇼츠)
-- ===============================================
INSERT INTO video_shorts (title, video_url, thumbnail_url, description, category, featured, order_index, duration_seconds, tags, view_count, active) VALUES
('원셀 클리닉 시설 소개', '/videos/clinic-tour.mp4', '/thumbnails/clinic-tour.jpg', '최첨단 시설과 안전한 수술실을 소개합니다', 'general', true, 1, 120, ARRAY['시설', '수술실', '안전'], 15234, true),
('안면윤곽 수술 과정', '/videos/facial-contouring.mp4', '/thumbnails/facial-contouring.jpg', '안면윤곽 수술의 전 과정을 투명하게 공개합니다', 'procedure', true, 2, 180, ARRAY['안면윤곽', '수술과정'], 8923, true),
('코성형 Before & After', '/videos/rhinoplasty-ba.mp4', '/thumbnails/rhinoplasty-ba.jpg', '코성형 전후 변화를 확인하세요', 'procedure', true, 3, 90, ARRAY['코성형', '전후사진'], 12456, true),
('환자 인터뷰 - 눈성형', '/videos/patient-interview-eye.mp4', '/thumbnails/patient-interview-eye.jpg', '눈성형 수술 후 만족스러운 결과를 얻은 환자 인터뷰', 'testimonial', true, 4, 150, ARRAY['환자후기', '눈성형'], 6789, true),
('수술 전 검사 과정', '/videos/pre-surgery-check.mp4', '/thumbnails/pre-surgery-check.jpg', '안전한 수술을 위한 철저한 사전 검사', 'educational', false, 5, 120, ARRAY['검사', '안전'], 3456, true),
('회복 과정 가이드', '/videos/recovery-guide.mp4', '/thumbnails/recovery-guide.jpg', '수술 후 빠른 회복을 위한 관리 방법', 'educational', false, 6, 180, ARRAY['회복', '관리'], 4567, true),
('리프팅 시술 소개', '/videos/lifting-intro.mp4', '/thumbnails/lifting-intro.jpg', '다양한 리프팅 시술 방법 소개', 'procedure', false, 7, 120, ARRAY['리프팅', '시술'], 5678, true),
('피부과 시술 모음', '/videos/derma-procedures.mp4', '/thumbnails/derma-procedures.jpg', '인기 피부과 시술을 한번에', 'procedure', false, 8, 150, ARRAY['피부과', '시술'], 7890, true);

-- ===============================================
-- YOUTUBE VIDEOS
-- ===============================================
INSERT INTO youtube_videos (title, youtube_id, description, category, featured, view_count, order_index, thumbnail_url, duration_seconds, published_at, tags, active) VALUES
('원셀 메디 클리닉 전체 투어', 'xK3mP2nQ9yZ', '클리닉 전체 시설을 둘러보는 상세한 투어 영상', 'facility', true, 25678, 1, 'https://img.youtube.com/vi/xK3mP2nQ9yZ/maxresdefault.jpg', 420, '2024-01-15', ARRAY['시설', '투어', '클리닉'], true),
('안면윤곽 수술의 모든 것', 'bN5rT4vW8xL', '안면윤곽 수술에 대한 전문의의 상세한 설명', 'educational', true, 18234, 2, 'https://img.youtube.com/vi/bN5rT4vW8xL/maxresdefault.jpg', 600, '2024-01-20', ARRAY['안면윤곽', '교육', '전문의'], true),
('코성형 FAQ 완벽 정리', 'cQ7B6jH9sK2', '코성형에 대해 자주 묻는 질문들을 정리했습니다', 'educational', true, 15678, 3, 'https://img.youtube.com/vi/cQ7B6jH9sK2/maxresdefault.jpg', 480, '2024-02-01', ARRAY['코성형', 'FAQ', '상담'], true),
('환자 경험담 - 6개월 후기', 'dP8C7kI0tL3', '수술 6개월 후 환자의 솔직한 경험담', 'testimonial', true, 12345, 4, 'https://img.youtube.com/vi/dP8C7kI0tL3/maxresdefault.jpg', 360, '2024-02-10', ARRAY['후기', '환자경험', '6개월'], true),
('눈성형 수술 방법 비교', 'eR9D8lJ1uM4', '다양한 눈성형 수술 방법의 장단점 비교', 'educational', false, 9876, 5, 'https://img.youtube.com/vi/eR9D8lJ1uM4/maxresdefault.jpg', 540, '2024-02-15', ARRAY['눈성형', '비교', '수술방법'], true),
('리프팅 시술 선택 가이드', 'fS0E9mK2vN5', '나에게 맞는 리프팅 시술 찾기', 'educational', false, 8765, 6, 'https://img.youtube.com/vi/fS0E9mK2vN5/maxresdefault.jpg', 450, '2024-02-20', ARRAY['리프팅', '가이드', '선택'], true),
('가슴성형 안전하게 하는 법', 'gT1F0nL3wO6', '가슴성형 수술의 안전성을 높이는 방법', 'educational', false, 7654, 7, 'https://img.youtube.com/vi/gT1F0nL3wO6/maxresdefault.jpg', 510, '2024-03-01', ARRAY['가슴성형', '안전', '수술'], true),
('피부과 시술 효과 극대화', 'hU2G1oM4xP7', '피부과 시술 효과를 높이는 관리법', 'educational', false, 6543, 8, 'https://img.youtube.com/vi/hU2G1oM4xP7/maxresdefault.jpg', 390, '2024-03-05', ARRAY['피부과', '관리', '효과'], true);

-- ===============================================
-- SELFIE REVIEWS (환자 후기)
-- ===============================================
INSERT INTO selfie_reviews (patient_name, patient_initial, procedure_type, selfie_url, review_text, rating, verified, featured, patient_age_range, treatment_date, recovery_weeks, consent_given, moderation_status, display_order, tags) VALUES
('김**', 'K.M', '안면윤곽', '/reviews/selfie-01.jpg', '광대뼈 축소술 받고 3개월이 지났습니다. 붓기도 다 빠지고 자연스러운 V라인이 되어서 너무 만족스러워요! 친구들도 자연스럽게 예뻐졌다고 하네요.', 5, true, true, '20대 후반', '2024-01-15', 12, true, 'approved', 1, ARRAY['안면윤곽', '광대축소', 'V라인']),

('이**', 'L.S', '코성형', '/reviews/selfie-02.jpg', '낮은 코때문에 고민이 많았는데 수술 후 인상이 확 달라졌어요. 무엇보다 자연스러워서 수술한지 모르겠다고들 해요. 원장님께 정말 감사드려요!', 5, true, true, '30대 초반', '2024-02-01', 8, true, 'approved', 2, ARRAY['코성형', '자연스러움']),

('박**', 'P.J', '눈성형', '/reviews/selfie-03.jpg', '쌍꺼풀 수술과 눈매교정 같이 받았습니다. 눈이 또렷해지니까 화장도 잘 먹고 인상이 밝아진 것 같아요. 회복도 빨라서 2주만에 일상생활 가능했어요.', 5, true, true, '20대 초반', '2024-02-10', 2, true, 'approved', 3, ARRAY['눈성형', '쌍꺼풀', '눈매교정']),

('최**', 'C.H', '리프팅', '/reviews/selfie-04.jpg', '40대가 되니 처짐이 심해져서 안면 리프팅 받았어요. 10년은 젊어진 느낌이에요. 목주름까지 개선되어서 너무 좋아요.', 5, true, true, '40대', '2023-12-15', 4, true, 'approved', 4, ARRAY['리프팅', '안티에이징']),

('정**', 'J.Y', '가슴성형', '/reviews/selfie-05.jpg', '출산 후 처진 가슴 때문에 고민했는데 수술 받고 자신감이 생겼어요. 자연스러운 모양과 촉감에 매우 만족합니다.', 5, true, false, '30대 후반', '2024-01-20', 6, true, 'approved', 5, ARRAY['가슴성형', '출산후']),

('강**', 'K.W', '지방흡입', '/reviews/selfie-06.jpg', '복부와 허벅지 지방흡입 받았습니다. 운동해도 빠지지 않던 부위가 깔끔하게 정리되어서 옷맵시가 살아났어요!', 5, true, false, '30대 초반', '2024-01-25', 4, true, 'approved', 6, ARRAY['지방흡입', '체형교정']),

('윤**', 'Y.S', '남성 코성형', '/reviews/selfie-07.jpg', '남자 코성형 전문이라고 해서 선택했는데 정말 잘한 선택이었습니다. 자연스럽고 남성적인 코라인이 나왔어요.', 5, true, false, '20대 후반', '2024-02-05', 3, true, 'approved', 7, ARRAY['남성성형', '코성형']),

('신**', 'S.M', '피부과 시술', '/reviews/selfie-08.jpg', '울쎄라와 써마지 패키지로 받았는데 확실히 탄력이 생기고 주름이 개선됐어요. 꾸준히 관리받으려고 합니다.', 4, true, false, '40대', '2024-02-15', 0, true, 'approved', 8, ARRAY['피부과', '울쎄라', '써마지']);

-- ===============================================
-- EVENT BANNERS (이벤트/프로모션)
-- ===============================================
INSERT INTO event_banners (title, description, image_url, link_url, button_text, active, priority, start_date, end_date, target_audience, event_type, discount_percentage, featured) VALUES
('2월 신년 이벤트', '새해를 맞아 특별한 할인 혜택을 제공합니다', '/banners/new-year-event.jpg', '/events/new-year', '자세히 보기', true, 100, '2024-02-01', '2024-02-29', 'all', 'promotion', 20, true),
('무료 상담 예약', '전문의 1:1 무료 상담을 받아보세요', '/banners/free-consultation.jpg', '/reservation', '상담 예약하기', true, 90, '2024-01-01', '2024-12-31', 'new', 'consultation', 0, true),
('안면윤곽 세미나', '안면윤곽 수술에 대한 무료 세미나 개최', '/banners/seminar.jpg', '/events/seminar', '신청하기', true, 80, '2024-03-01', '2024-03-15', 'all', 'seminar', 0, false),
('피부과 패키지', '울쎄라+써마지 패키지 특별가', '/banners/derma-package.jpg', '/procedures/derma-package', '패키지 보기', true, 70, '2024-02-15', '2024-03-31', 'all', 'promotion', 30, false);

-- ===============================================
-- GALLERY ITEMS (전후 사진)
-- ===============================================
INSERT INTO gallery_items (procedure_id, title, description, before_image_url, after_image_url, patient_age_range, procedure_date, recovery_weeks, patient_testimonial, consent_given, featured, display_order, tags) VALUES
((SELECT id FROM procedures WHERE slug='facial-contouring-revision'), '안면윤곽 재수술 케이스', '첫 수술 후 불만족으로 재수술 진행', '/gallery/ba-facial-01-before.jpg', '/gallery/ba-facial-01-after.jpg', '30대', '2024-01-10', 8, '첫 수술보다 훨씬 자연스럽고 만족스러워요', true, true, 1, ARRAY['안면윤곽', '재수술']),
((SELECT id FROM procedures WHERE slug='custom-rhinoplasty'), '낮은코 성형 케이스', '낮고 퍼진 코를 오똑하게', '/gallery/ba-nose-01-before.jpg', '/gallery/ba-nose-01-after.jpg', '20대', '2024-01-15', 4, '콤플렉스가 해결되어 자신감이 생겼어요', true, true, 2, ARRAY['코성형', '낮은코']),
((SELECT id FROM procedures WHERE slug='eye-shape-correction'), '눈매교정 케이스', '졸려보이는 눈을 또렷하게', '/gallery/ba-eye-01-before.jpg', '/gallery/ba-eye-01-after.jpg', '20대', '2024-01-20', 2, '눈이 커지니 인상이 완전히 달라졌어요', true, true, 3, ARRAY['눈성형', '눈매교정']),
((SELECT id FROM procedures WHERE slug='breast-augmentation'), '가슴확대 케이스', '작은 가슴을 자연스럽게 확대', '/gallery/ba-breast-01-before.jpg', '/gallery/ba-breast-01-after.jpg', '30대', '2024-01-25', 4, '자연스러운 모양과 촉감에 만족합니다', true, false, 4, ARRAY['가슴성형', '확대']);

-- ===============================================
-- 데이터 삽입 완료 메시지
-- ===============================================
DO $$
BEGIN
  RAISE NOTICE '===============================================';
  RAISE NOTICE '클리닉 콘텐츠 시드 데이터 삽입 완료!';
  RAISE NOTICE '===============================================';
  RAISE NOTICE '삽입된 데이터:';
  RAISE NOTICE '- 시술 카테고리: 9개';
  RAISE NOTICE '- 시술/수술: 40개+';
  RAISE NOTICE '- 의료진: 4명';
  RAISE NOTICE '- 클리닉 특징: 12개';
  RAISE NOTICE '- 차별화 요소: 6개';
  RAISE NOTICE '- 비디오 쇼츠: 8개';
  RAISE NOTICE '- 유튜브 비디오: 8개';
  RAISE NOTICE '- 환자 후기: 8개';
  RAISE NOTICE '- 이벤트 배너: 4개';
  RAISE NOTICE '- 갤러리 아이템: 4개';
  RAISE NOTICE '===============================================';
END $$;