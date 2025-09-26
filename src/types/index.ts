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
  active: boolean
  priority: number
  start_date: string
  end_date: string
  created_at?: string
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