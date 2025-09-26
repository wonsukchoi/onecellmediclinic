import { supabase } from '../../config/supabase';

export interface BookAppointmentRequest {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  serviceType: string;
  procedureId?: number;
  providerId?: number;
  preferredDate: string;
  preferredTime: string;
  durationMinutes?: number;
  notes?: string;
  appointmentType?: string;
}

export interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  providerId: number;
  providerName: string;
  currentBookings: number;
  maxBookings: number;
}

export interface Provider {
  id: number;
  name: string;
  title: string;
  specialization: string;
}

export interface AvailabilityResponse {
  success: boolean;
  availability: TimeSlot[];
  providers: Provider[];
  error?: string;
}

export interface AppointmentResponse {
  success: boolean;
  appointment?: any;
  error?: string;
  confirmationCode?: string;
}

class BookingService {
  private readonly functionsUrl: string;

  constructor() {
    // Get the Supabase URL and construct the Edge Functions URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://weqqkknwpgremfugcbvz.supabase.co';
    this.functionsUrl = `${supabaseUrl}/functions/v1`;
  }

  /**
   * Get auth headers for authenticated requests
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  /**
   * Book an appointment
   */
  async bookAppointment(appointmentData: BookAppointmentRequest): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${this.functionsUrl}/book-appointment`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      return data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book appointment',
      };
    }
  }

  /**
   * Get provider availability
   */
  async getAvailability(params: {
    providerId?: number;
    procedureId?: number;
    startDate: string;
    endDate?: string;
    durationMinutes?: number;
  }): Promise<AvailabilityResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params.providerId) searchParams.append('providerId', params.providerId.toString());
      if (params.procedureId) searchParams.append('procedureId', params.procedureId.toString());
      searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.durationMinutes) searchParams.append('durationMinutes', params.durationMinutes.toString());

      const response = await fetch(`${this.functionsUrl}/get-availability?${searchParams}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get availability');
      }

      return data;
    } catch (error) {
      console.error('Error getting availability:', error);
      return {
        success: false,
        availability: [],
        providers: [],
        error: error instanceof Error ? error.message : 'Failed to get availability',
      };
    }
  }

  /**
   * Get appointments for the current user
   */
  async getUserAppointments(): Promise<{ success: boolean; appointments?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          procedures(
            id,
            name,
            duration_minutes,
            price_range
          ),
          providers(
            id,
            full_name,
            title,
            specialization
          )
        `)
        .eq('patient_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, appointments: appointments || [] };
    } catch (error) {
      console.error('Error getting user appointments:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get appointments',
      };
    }
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    appointmentId: number,
    cancellationReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: cancellationReason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel appointment',
      };
    }
  }

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: number,
    newDate: string,
    newTime: string,
    providerId?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check availability for the new time slot
      if (providerId) {
        const availability = await this.getAvailability({
          providerId,
          startDate: newDate,
          endDate: newDate,
        });

        if (!availability.success) {
          return { success: false, error: 'Failed to check availability' };
        }

        const isAvailable = availability.availability.some(
          (slot) => slot.date === newDate && slot.startTime === newTime && slot.available
        );

        if (!isAvailable) {
          return { success: false, error: 'Selected time slot is not available' };
        }
      }

      const { error } = await supabase
        .from('appointments')
        .update({
          preferred_date: newDate,
          preferred_time: newTime,
          provider_id: providerId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reschedule appointment',
      };
    }
  }

  /**
   * Get all providers
   */
  async getProviders(): Promise<{ success: boolean; providers?: any[]; error?: string }> {
    try {
      const { data: providers, error } = await supabase
        .from('providers')
        .select(`
          *,
          procedure_providers(
            procedures(
              id,
              name,
              slug
            )
          )
        `)
        .eq('active', true)
        .order('full_name');

      if (error) {
        throw error;
      }

      return { success: true, providers: providers || [] };
    } catch (error) {
      console.error('Error getting providers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get providers',
      };
    }
  }

  /**
   * Get all procedures
   */
  async getProcedures(): Promise<{ success: boolean; procedures?: any[]; error?: string }> {
    try {
      const { data: procedures, error } = await supabase
        .from('procedures')
        .select(`
          *,
          procedure_categories(
            id,
            name,
            description
          ),
          procedure_providers(
            providers(
              id,
              full_name,
              title,
              specialization
            )
          )
        `)
        .eq('active', true)
        .order('display_order')
        .order('name');

      if (error) {
        throw error;
      }

      return { success: true, procedures: procedures || [] };
    } catch (error) {
      console.error('Error getting procedures:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get procedures',
      };
    }
  }

  /**
   * Get procedure categories
   */
  async getProcedureCategories(): Promise<{ success: boolean; categories?: any[]; error?: string }> {
    try {
      const { data: categories, error } = await supabase
        .from('procedure_categories')
        .select(`
          *,
          procedures(
            id,
            name,
            slug,
            description,
            duration_minutes,
            price_range,
            featured_image_url
          )
        `)
        .eq('active', true)
        .eq('procedures.active', true)
        .order('display_order');

      if (error) {
        throw error;
      }

      return { success: true, categories: categories || [] };
    } catch (error) {
      console.error('Error getting procedure categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get procedure categories',
      };
    }
  }
}

export const bookingService = new BookingService();