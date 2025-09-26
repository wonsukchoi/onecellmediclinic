import { supabase } from '../../config/supabase';

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
   * Submit a consultation request
   */
  async submitConsultationRequest(requestData: ConsultationRequest): Promise<ConsultationResponse> {
    try {
      const response = await fetch(`${this.functionsUrl}/consultation-request`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: consultations, error } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          assigned_provider:providers(
            id,
            full_name,
            title,
            specialization,
            profile_image_url
          )
        `)
        .eq('patient_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, consultations: consultations || [] };
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
      const { data: consultation, error } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          assigned_provider:providers(
            id,
            full_name,
            title,
            specialization,
            profile_image_url,
            bio,
            consultation_fee
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, consultation };
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
      const { data: tracking, error } = await supabase
        .from('consultation_tracking')
        .select(`
          id,
          status,
          notes,
          created_at,
          created_by
        `)
        .eq('consultation_request_id', consultationId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      const formattedTracking: ConsultationTracking[] = (tracking || []).map((item) => ({
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.status) updateData.status = updates.status;
      if (updates.assignedProviderId) updateData.assigned_provider_id = updates.assignedProviderId;
      if (updates.responseNotes) updateData.response_notes = updates.responseNotes;
      if (updates.estimatedCostRange) updateData.estimated_cost_range = updates.estimatedCostRange;
      if (updates.recommendedProcedures) updateData.recommended_procedures = updates.recommendedProcedures;
      if (updates.followUpRequired !== undefined) updateData.follow_up_required = updates.followUpRequired;

      const { error } = await supabase
        .from('consultation_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Add tracking entry
      await supabase.from('consultation_tracking').insert([
        {
          consultation_request_id: id,
          status: updates.status || 'updated',
          notes: updates.responseNotes || 'Consultation request updated',
          created_by: user.id,
          created_at: new Date().toISOString(),
        },
      ]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Get consultation details
      const { data: consultation, error: consultationError } = await supabase
        .from('consultation_requests')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (consultationError || !consultation) {
        return { success: false, error: 'Consultation not found' };
      }

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_name: consultation.patient_name,
            patient_email: consultation.patient_email,
            patient_phone: consultation.patient_phone,
            service_type: appointmentData.appointmentType || 'consultation',
            procedure_id: appointmentData.procedureId,
            provider_id: appointmentData.providerId || consultation.assigned_provider_id,
            preferred_date: appointmentData.preferredDate,
            preferred_time: appointmentData.preferredTime,
            notes: appointmentData.notes || consultation.concerns,
            status: 'pending',
            appointment_type: appointmentData.appointmentType || 'consultation',
            created_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      // Update consultation status
      await supabase
        .from('consultation_requests')
        .update({
          status: 'converted_to_appointment',
          follow_up_required: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', consultationId);

      // Add tracking entry
      await supabase.from('consultation_tracking').insert([
        {
          consultation_request_id: consultationId,
          status: 'converted_to_appointment',
          notes: `Converted to appointment #${appointment.id}`,
          created_by: user.id,
          created_at: new Date().toISOString(),
        },
      ]);

      return { success: true, appointmentId: appointment.id };
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      const [totalResult, newResult, inProgressResult, completedResult, urgentResult] = await Promise.all([
        supabase.from('consultation_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('consultation_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new'),
        supabase
          .from('consultation_requests')
          .select('*', { count: 'exact', head: true })
          .in('status', ['in_progress', 'reviewing', 'awaiting_response']),
        supabase
          .from('consultation_requests')
          .select('*', { count: 'exact', head: true })
          .in('status', ['completed', 'converted_to_appointment']),
        supabase
          .from('consultation_requests')
          .select('*', { count: 'exact', head: true })
          .eq('urgency_level', 'high')
          .eq('status', 'new'),
      ]);

      return {
        success: true,
        stats: {
          total: totalResult.count || 0,
          newRequests: newResult.count || 0,
          inProgress: inProgressResult.count || 0,
          completed: completedResult.count || 0,
          urgentRequests: urgentResult.count || 0,
        },
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