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