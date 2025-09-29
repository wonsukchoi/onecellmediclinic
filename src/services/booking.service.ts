import { supabase } from './supabase';
import { getAuthHeadersFast, getFunctionsUrl, getSessionCached } from '../utils/fast-auth';

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
    // Use centralized functions URL
    this.functionsUrl = getFunctionsUrl();
  }

  /**
   * Get auth headers for authenticated requests (optimized with fast localStorage access)
   */
  private getAuthHeaders(): HeadersInit {
    // Use centralized auth helper
    return getAuthHeadersFast();
  }

  /**
   * Book an appointment
   */
  async bookAppointment(appointmentData: BookAppointmentRequest): Promise<AppointmentResponse> {
    try {
      const response = await fetch(`${this.functionsUrl}/book-appointment`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
        headers: this.getAuthHeaders(),
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
      // Use cached getSession for better performance
      const { data: { session } } = await getSessionCached(supabase);
      if (!session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${this.functionsUrl}/manage-appointments?patientEmail=${encodeURIComponent(session.user.email!)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get appointments');
      }

      return { success: true, appointments: result.appointments || [] };
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
      const response = await fetch(`${this.functionsUrl}/manage-appointments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'cancel',
          appointmentId,
          appointmentData: {
            cancellationReason
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel appointment');
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

      const response = await fetch(`${this.functionsUrl}/manage-appointments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'reschedule',
          appointmentId,
          appointmentData: {
            newDate,
            newTime,
            providerId
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reschedule appointment');
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
      const response = await fetch(`${this.functionsUrl}/manage-providers`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get providers');
      }

      return { success: true, providers: result.providers || [] };
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
      const response = await fetch(`${this.functionsUrl}/manage-procedures`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get procedures');
      }

      return { success: true, procedures: result.procedures || [] };
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
      const response = await fetch(`${this.functionsUrl}/manage-procedures`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'list_categories'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get procedure categories');
      }

      return { success: true, categories: result.categories || [] };
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