import React, { createContext, useContext, ReactNode } from "react";
import { getAuthHeaders as getAuthHeadersUtil, getFunctionsUrl, getSessionCached } from "../utils/fast-auth";
import { useSupabase } from "./SupabaseContext";

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

interface ConsultationContextType {
  submitConsultationRequest: (requestData: ConsultationRequest) => Promise<ConsultationResponse>;
  getUserConsultationRequests: () => Promise<{
    success: boolean;
    consultations?: any[];
    error?: string;
  }>;
  getConsultationRequest: (id: number) => Promise<{ success: boolean; consultation?: any; error?: string }>;
  getConsultationTracking: (consultationId: number) => Promise<{ success: boolean; tracking?: ConsultationTracking[]; error?: string }>;
  updateConsultationRequest: (id: number, updates: {
    status?: string;
    assignedProviderId?: number;
    responseNotes?: string;
    estimatedCostRange?: string;
    recommendedProcedures?: string[];
    followUpRequired?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  convertToAppointment: (consultationId: number, appointmentData: {
    procedureId?: number;
    providerId?: number;
    preferredDate: string;
    preferredTime: string;
    appointmentType?: string;
    notes?: string;
  }) => Promise<{ success: boolean; appointmentId?: number; error?: string }>;
  getConsultationStats: () => Promise<{
    success: boolean;
    stats?: {
      total: number;
      newRequests: number;
      inProgress: number;
      completed: number;
      urgentRequests: number;
    };
    error?: string;
  }>;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

interface ConsultationProviderProps {
  children: ReactNode;
}

export const ConsultationProvider: React.FC<ConsultationProviderProps> = ({ children }) => {
  const { client } = useSupabase();
  const functionsUrl = getFunctionsUrl();

  const getAuthHeaders = (): HeadersInit => {
    return getAuthHeadersUtil();
  };

  const submitConsultationRequest = async (requestData: ConsultationRequest): Promise<ConsultationResponse> => {
    try {
      const response = await fetch(`${functionsUrl}/consultation-request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit consultation request');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit consultation request',
      };
    }
  };

  const getUserConsultationRequests = async (): Promise<{
    success: boolean;
    consultations?: any[];
    error?: string;
  }> => {
    try {
      const { data: { session } } = await getSessionCached(client);
      if (!session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${functionsUrl}/manage-consultation-requests?patientEmail=${encodeURIComponent(session.user.email!)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation requests');
      }

      return { success: true, consultations: result.consultations || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation requests',
      };
    }
  };

  const getConsultationRequest = async (
    id: number
  ): Promise<{ success: boolean; consultation?: any; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-consultation-requests?id=${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get consultation request');
      }

      return { success: true, consultation: result.consultation };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation request',
      };
    }
  };

  const getConsultationTracking = async (
    consultationId: number
  ): Promise<{ success: boolean; tracking?: ConsultationTracking[]; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation tracking',
      };
    }
  };

  const updateConsultationRequest = async (
    id: number,
    updates: {
      status?: string;
      assignedProviderId?: number;
      responseNotes?: string;
      estimatedCostRange?: string;
      recommendedProcedures?: string[];
      followUpRequired?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update consultation request',
      };
    }
  };

  const convertToAppointment = async (
    consultationId: number,
    appointmentData: {
      procedureId?: number;
      providerId?: number;
      preferredDate: string;
      preferredTime: string;
      appointmentType?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; appointmentId?: number; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert consultation to appointment',
      };
    }
  };

  const getConsultationStats = async (): Promise<{
    success: boolean;
    stats?: {
      total: number;
      newRequests: number;
      inProgress: number;
      completed: number;
      urgentRequests: number;
    };
    error?: string;
  }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-consultation-requests`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get consultation statistics',
      };
    }
  };

  const value: ConsultationContextType = {
    submitConsultationRequest,
    getUserConsultationRequests,
    getConsultationRequest,
    getConsultationTracking,
    updateConsultationRequest,
    convertToAppointment,
    getConsultationStats,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
};

export const useConsultation = (): ConsultationContextType => {
  const context = useContext(ConsultationContext);
  if (context === undefined) {
    throw new Error("useConsultation must be used within a ConsultationProvider");
  }
  return context;
};

export default ConsultationContext;