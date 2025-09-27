// Admin-specific types for the OneCell Medical Clinic admin panel

export interface VideoShort {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  category: string;
  tags?: string[];
  view_count: number;
  featured: boolean;
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ClinicFeature {
  id: number;
  title: string;
  description: string;
  icon_name?: string;
  image_url?: string;
  display_order: number;
  active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SelfieReview {
  id: number;
  patient_name: string;
  patient_initial?: string;
  review_text: string;
  rating: number;
  procedure_type?: string;
  before_image_url?: string;
  after_image_url?: string;
  selfie_image_url?: string;
  review_date: string;
  verified: boolean;
  featured: boolean;
  display_order: number;
  consent_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface YouTubeVideo {
  id: number;
  title: string;
  description?: string;
  youtube_video_id: string;
  thumbnail_url?: string;
  duration?: string;
  category: string;
  tags?: string[];
  view_count?: number;
  featured: boolean;
  active: boolean;
  display_order: number;
  published_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Differentiator {
  id: number;
  title: string;
  description: string;
  icon_name?: string;
  image_url?: string;
  badge_text?: string;
  display_order: number;
  active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

// Entity types for unified handling
export type AdminEntity =
  | 'procedure_categories'
  | 'procedures'
  | 'providers'
  | 'video_shorts'
  | 'clinic_features'
  | 'event_banners'
  | 'selfie_reviews'
  | 'youtube_videos'
  | 'differentiators'
  | 'blog_posts'
  | 'gallery_items'
  | 'appointments'
  | 'consultation_requests'
  | 'contact_submissions';

// Entity configuration for admin interface
export interface EntityConfig {
  name: string;
  singularName: string;
  icon: string;
  columns: TableColumn[];
  searchFields: string[];
  filterFields: FilterField[];
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  defaultSort: { field: string; direction: 'asc' | 'desc' };
}

export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'badge' | 'actions';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, item: any) => React.ReactNode;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
}

export interface AdminFormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'file' | 'url' | 'email' | 'tel';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | undefined;
  accept?: string; // for file inputs
  multiple?: boolean;
}

export interface AdminStats {
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  totalConsultations: number;
  newConsultations: number;
  totalContactSubmissions: number;
  newContactSubmissions: number;
  totalProcedures: number;
  activeProcedures: number;
  totalProviders: number;
  activeProviders: number;
  totalBlogPosts: number;
  publishedBlogPosts: number;
  totalGalleryItems: number;
  featuredGalleryItems: number;
  totalVideoShorts: number;
  activeVideoShorts: number;
  totalYouTubeVideos: number;
  activeYouTubeVideos: number;
  totalSelfieReviews: number;
  verifiedSelfieReviews: number;
  totalEventBanners: number;
  activeEventBanners: number;
  recentActivity: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  type: 'appointment' | 'consultation' | 'contact' | 'content' | 'user';
  action: 'created' | 'updated' | 'deleted' | 'published' | 'unpublished';
  entity: AdminEntity;
  entityId: string;
  description: string;
  user_id?: string;
  user_name?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  stats: AdminStats | null;
  refreshStats: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' };
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminFormData {
  email: string;
  password: string;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}