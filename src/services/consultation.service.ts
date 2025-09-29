import { supabase } from './supabase';
import { getAuthHeadersFast, getFunctionsUrl, getSessionCached } from '../utils/fast-auth';

export interface ConsultationRequest {
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  patientAge?: number;
  consultationType: string;
  procedureInterest?: string;
  concerns?: string;
  medicalHistory?: string;
  currentMedications?: string;
  preferredContactMethod?: string;
  urgencyLevel?: string;
  photos?: string[];
}

export interface ConsultationResponse {
  success: boolean;
  consultation?: any;
  error?: string;
  trackingId?: number;
  message?: string;
  estimatedResponseTime?: string;
}

export interface ConsultationTracking {
  id: number;
  status: string;
  notes: string;
  createdAt: string;
  createdBy?: string;
}

class ConsultationService {
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
   * Submit a consultation request
   */
  async submitConsultationRequest(requestData: ConsultationRequest): Promise<ConsultationResponse> {
    try {
      const response = await fetch(`${this.functionsUrl}/consultation-request`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit consultation request');
      }

      return data;
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit consultation request',
      };
    }
  }

  /**
   * Get consultation requests for the current user
   */
  async getUserConsultationRequests(): Promise<{
    success: boolean;
    consultations?: any[];
    error?: string;
  }> {
    try {
      // Use cached getSession for better performance
      const { data: { session } } = await getSessionCached(supabase);
      if (!session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests?patientEmail=${encodeURIComponent(session.user.email!)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation requests');
      }

      return { success: true, consultations: result.consultations || [] };
    } catch (error) {
      console.error('Error getting user consultation requests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation requests',
      };
    }
  }

  /**
   * Get consultation request by ID
   */
  async getConsultationRequest(
    id: number
  ): Promise<{ success: boolean; consultation?: any; error?: string }> {
    try {
      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests?id=${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation request');
      }

      return { success: true, consultation: result.consultation };
    } catch (error) {
      console.error('Error getting consultation request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation request',
      };
    }
  }

  /**
   * Get consultation tracking history
   */
  async getConsultationTracking(
    consultationId: number
  ): Promise<{ success: boolean; tracking?: ConsultationTracking[]; error?: string }> {
    try {
      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'get_tracking',
          consultationId
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation tracking');
      }

      const formattedTracking: ConsultationTracking[] = (result.tracking || []).map((item: any) => ({
        id: item.id,
        status: item.status,
        notes: item.notes,
        createdAt: item.created_at,
        createdBy: item.created_by,
      }));

      return { success: true, tracking: formattedTracking };
    } catch (error) {
      console.error('Error getting consultation tracking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation tracking',
      };
    }
  }

  /**
   * Update consultation request (for staff)
   */
  async updateConsultationRequest(
    id: number,
    updates: {
      status?: string;
      assignedProviderId?: number;
      responseNotes?: string;
      estimatedCostRange?: string;
      recommendedProcedures?: string[];
      followUpRequired?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'update',
          consultationId: id,
          updates
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update consultation request');
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating consultation request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update consultation request',
      };
    }
  }

  /**
   * Convert consultation to appointment
   */
  async convertToAppointment(
    consultationId: number,
    appointmentData: {
      procedureId?: number;
      providerId?: number;
      preferredDate: string;
      preferredTime: string;
      appointmentType?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; appointmentId?: number; error?: string }> {
    try {
      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'convert_to_appointment',
          consultationId,
          appointmentData
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert consultation to appointment');
      }

      return { success: true, appointmentId: result.appointmentId };
    } catch (error) {
      console.error('Error converting consultation to appointment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert consultation to appointment',
      };
    }
  }

  /**
   * Get consultation statistics (for admin dashboard)
   */
  async getConsultationStats(): Promise<{
    success: boolean;
    stats?: {
      total: number;
      newRequests: number;
      inProgress: number;
      completed: number;
      urgentRequests: number;
    };
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          action: 'get_stats'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation statistics');
      }

      return {
        success: true,
        stats: result.stats,
      };
    } catch (error) {
      console.error('Error getting consultation stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation statistics',
      };
    }
  }
}

export const consultationService = new ConsultationService();