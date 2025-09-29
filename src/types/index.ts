// Database Types
export interface ContactSubmission {
  id?: number
  name: string
  email: string
  phone: string
  service_type: string
  message: string
  preferred_contact: 'email' | 'phone'
  created_at?: string
}

export interface Appointment {
  id?: number
  patient_name: string
  patient_email: string
  patient_phone: string
  service_type: string
  preferred_date: string
  preferred_time: string
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at?: string
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  date_of_birth?: string
  role?: 'user' | 'admin' | 'provider'
  created_at?: string
  updated_at?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  content: string
  excerpt?: string
  published: boolean
  featured_image?: string
  author_id?: string
  created_at?: string
  updated_at?: string
}

export interface EventBanner {
  id: number
  title: string
  description: string
  image_url?: string
  link_url?: string
  button_text?: string
  active: boolean
  priority: number
  start_date: string
  end_date: string
  target_audience?: string
  event_type?: string
  discount_percentage?: number
  featured?: boolean
  registration_link?: string
  max_participants?: number
  participants_count?: number
  event_location?: string
  registration_deadline?: string
  terms_conditions?: string
  view_count?: number
  created_at?: string
  updated_at?: string
}

// Form Data Types
export interface ContactFormData {
  name: string
  email: string
  phone: string
  serviceType: string
  message: string
  preferredContact: 'email' | 'phone'
}

export interface AppointmentFormData {
  patientName: string
  patientEmail: string
  patientPhone: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  notes?: string
}

export interface AuthFormData {
  email: string
  password: string
  name?: string
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Component Props Types
export interface CarouselItem {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
}

export interface ReviewItem {
  id: string
  name: string
  rating: number
  comment: string
  date: string
  verified?: boolean
}

export interface FeatureCard {
  id: string
  icon: string
  title: string
  description: string
  link?: string
}

export interface ServiceType {
  id: string
  name: string
  description?: string
  price?: string
  duration?: string
  category: 'plastic-surgery' | 'dermatology' | 'aesthetic' | 'consultation'
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  children?: NavigationItem[]
}

// Extended Navigation types for Navigation component
export interface NavItem {
  label: string
  path: string
  description?: string
  icon?: string
  featured?: boolean
  target_blank?: boolean
  page_id?: string
}

export interface NavCategory {
  id: string
  title: string
  items: NavItem[]
  featured?: boolean
  megaMenu?: boolean
}

// Context Types
export interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<ApiResponse>
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<ApiResponse>
  signOut: () => Promise<ApiResponse>
  updateProfile: (userData: Partial<UserProfile>) => Promise<ApiResponse>
}

// Hook Types
export interface UseFormReturn<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
  handleChange: (name: keyof T, value: any) => void
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => void
  reset: () => void
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  limit: number
}

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// Admin Types
export interface Procedure {
  id: number
  category_id: number
  name: string
  slug: string
  description?: string
  detailed_description?: string
  duration_minutes?: number
  price_range?: string
  preparation_instructions?: string
  recovery_time?: string
  featured_image_url?: string
  gallery_images?: string[]
  active: boolean
  display_order: number
  tags?: string[]
  created_at: string
  updated_at: string
  category?: ProcedureCategory
}

export interface ProcedureCategory {
  id: number
  name: string
  description?: string
  icon_name?: string
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Provider {
  id: number
  user_id?: string
  full_name: string
  title?: string
  specialization?: string
  bio?: string
  profile_image_url?: string
  years_experience?: number
  education?: string[]
  certifications?: string[]
  languages?: string[]
  consultation_fee?: number
  active: boolean
  availability_schedule?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ConsultationRequest {
  id: number
  patient_name: string
  patient_email: string
  patient_phone?: string
  patient_age?: number
  consultation_type: string
  procedure_interest?: string
  concerns?: string
  medical_history?: string
  current_medications?: string
  preferred_contact_method: string
  urgency_level: string
  photos?: string[]
  status: string
  assigned_provider_id?: number
  response_notes?: string
  estimated_cost_range?: string
  recommended_procedures?: string[]
  follow_up_required: boolean
  created_at: string
  updated_at: string
  provider?: Provider
}

export interface GalleryItem {
  id: number
  procedure_id?: number
  provider_id?: number
  title?: string
  description?: string
  before_image_url: string
  after_image_url: string
  additional_images?: string[]
  patient_age_range?: string
  procedure_date?: string
  recovery_weeks?: number
  patient_testimonial?: string
  consent_given: boolean
  featured: boolean
  display_order: number
  tags?: string[]
  created_at: string
  updated_at: string
  procedure?: Procedure
  provider?: Provider
}

export interface AvailabilitySlot {
  id: number
  provider_id: number
  date: string
  start_time: string
  end_time: string
  slot_duration_minutes: number
  max_bookings: number
  current_bookings: number
  available: boolean
  blocked_reason?: string
  created_at: string
  provider?: Provider
}

export interface AdminStats {
  totalAppointments: number
  pendingAppointments: number
  todayAppointments: number
  totalConsultations: number
  newConsultations: number
  totalProcedures: number
  activeProcedures: number
  totalProviders: number
  activeProviders: number
  totalGalleryItems: number
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  id: string
  type: 'appointment' | 'consultation' | 'content' | 'user'
  action: string
  description: string
  user_id?: string
  user_name?: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AdminFormData {
  email: string
  password: string
}

export interface ContentFormData {
  title: string
  description?: string
  content?: string
  category?: string
  tags?: string[]
  active?: boolean
  featured?: boolean
}

export interface FilterParams {
  search?: string
  status?: string
  category?: string
  provider?: string
  dateFrom?: string
  dateTo?: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, item: any) => React.ReactNode
}

export interface AdminContextType {
  isAdmin: boolean
  loading: boolean
  stats: AdminStats | null
  refreshStats: () => Promise<void>
}

// CMS Types
export type PageStatus = 'draft' | 'published' | 'archived'
export type BlockType = 'text' | 'image' | 'video' | 'gallery' | 'cta' | 'spacer' | 'html'
export type NavType = 'link' | 'dropdown' | 'megamenu' | 'divider'

export interface DynamicPage {
  id: string
  title: string
  slug: string
  description?: string
  keywords?: string
  meta_title?: string
  meta_description?: string
  template_id: string
  status: PageStatus
  featured_image?: string
  author_id?: string
  published_at?: string
  created_at: string
  updated_at: string
  view_count: number
  seo_canonical_url?: string
  seo_og_image?: string
  custom_css?: string
  custom_js?: string
  blocks?: PageBlock[]
}

export interface PageBlock {
  id: string
  page_id: string
  block_type: BlockType
  title?: string
  content: Record<string, any>
  styles?: Record<string, any>
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface HeaderNavigation {
  id: string
  label: string
  label_en?: string
  url?: string
  page_id?: string
  nav_type: NavType
  parent_id?: string
  sort_order: number
  is_visible: boolean
  icon_name?: string
  target_blank: boolean
  css_classes?: string
  access_level: string
  created_at: string
  updated_at: string
  children?: HeaderNavigation[]
}

export interface PageTemplate {
  id: string
  name: string
  description?: string
  template_code: string
  css_classes?: string
  available_blocks: string[]
  is_active: boolean
  preview_image?: string
  created_at: string
  updated_at: string
}

export interface PageAnalytics {
  id: string
  page_id: string
  visitor_ip?: string
  user_agent?: string
  referrer?: string
  session_id?: string
  visited_at: string
  time_on_page?: number
  bounce: boolean
}

export interface PageFormData {
  title: string
  slug: string
  description?: string
  keywords?: string
  meta_title?: string
  meta_description?: string
  template_id: string
  status: PageStatus
  featured_image?: string
  seo_canonical_url?: string
  seo_og_image?: string
  custom_css?: string
  custom_js?: string
}

export interface BlockFormData {
  block_type: BlockType
  title?: string
  content: Record<string, any>
  styles?: Record<string, any>
  sort_order: number
  is_visible: boolean
}

export interface NavigationFormData {
  label: string
  url?: string
  page_id?: string
  nav_type: NavType
  parent_id?: string
  sort_order: number
  is_visible: boolean
  icon_name?: string
  target_blank: boolean
  css_classes?: string
  access_level: string
}

// Member System Types
export interface MemberProfile {
  id: string
  email: string
  name?: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  medical_history?: string
  allergies?: string
  current_medications?: string
  insurance_provider?: string
  insurance_number?: string
  profile_image_url?: string
  email_verified?: boolean
  phone_verified?: boolean
  membership_type?: 'basic' | 'premium' | 'vip'
  member_since?: string
  last_visit?: string
  total_visits?: number
  created_at?: string
  updated_at?: string
}

export interface MedicalRecord {
  id: string
  member_id: string
  provider_id?: string
  visit_date: string
  diagnosis: string
  treatment_plan?: string
  notes?: string
  prescribed_medications?: string
  follow_up_date?: string
  visit_type: 'consultation' | 'procedure' | 'follow_up' | 'emergency'
  status: 'completed' | 'in_progress' | 'cancelled'
  attachments?: string[]
  created_at: string
  updated_at: string
  provider?: Provider
}

export interface Prescription {
  id: string
  member_id: string
  provider_id: string
  medical_record_id?: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  quantity: number
  refills_remaining?: number
  prescribed_date: string
  expiry_date?: string
  status: 'active' | 'completed' | 'cancelled'
  pharmacy_notes?: string
  created_at: string
  provider?: Provider
}

export interface PaymentHistory {
  id: string
  member_id: string
  appointment_id?: string
  medical_record_id?: string
  amount: number
  currency: string
  payment_method: 'card' | 'cash' | 'insurance' | 'bank_transfer'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  description: string
  payment_date: string
  receipt_url?: string
  insurance_claimed?: boolean
  insurance_amount?: number
  created_at: string
}

export interface ConsultationNote {
  id: string
  member_id: string
  provider_id: string
  appointment_id?: string
  consultation_type: 'online' | 'in_person' | 'phone'
  chief_complaint: string
  symptoms?: string
  examination_findings?: string
  assessment: string
  recommendations?: string
  follow_up_instructions?: string
  priority_level: 'low' | 'medium' | 'high' | 'urgent'
  attachments?: string[]
  consultation_date: string
  duration_minutes?: number
  status: 'draft' | 'completed' | 'reviewed'
  created_at: string
  updated_at: string
  provider?: Provider
}

export interface MemberLoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface MemberSignupFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  phone: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  agreeToTerms: boolean
  agreeToPrivacy: boolean
  agreeToMarketing?: boolean
}

export interface MemberDashboardData {
  profile: MemberProfile
  upcomingAppointments: Appointment[]
  recentMedicalRecords: MedicalRecord[]
  activePrescriptions: Prescription[]
  recentPayments: PaymentHistory[]
  unreadNotifications: number
  membershipStatus: {
    type: 'basic' | 'premium' | 'vip'
    benefits: string[]
    expiryDate?: string
  }
}

export interface MemberPasswordResetFormData {
  email: string
}

export interface MemberPasswordUpdateFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Hero Carousel Types
export interface HeroCarousel {
  id: string
  title_kr: string
  title_en: string
  subtitle_kr: string
  subtitle_en: string
  description_kr: string
  description_en: string
  background_image_url: string
  cta_text_kr: string
  cta_text_en: string
  cta_link: string
  order_index: number
  is_active: boolean
  text_position: 'left' | 'center' | 'right'
  overlay_opacity: number
  created_at?: string
  updated_at?: string
}

export interface HeroCarouselItem {
  id: string
  image: string
  title: string
  subtitle: string
  description: string
  cta: {
    text: string
    link: string
  }
  overlay: boolean
  textPosition: 'left' | 'center' | 'right'
}