import React, { createContext, useContext, type ReactNode } from "react";
import { getAuthHeaders as getAuthHeadersUtil, getFunctionsUrl, getSessionCached } from "../utils/fast-auth";
import { useSupabase } from "./SupabaseContext";

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

interface BookingContextType {
  bookAppointment: (appointmentData: BookAppointmentRequest) => Promise<AppointmentResponse>;
  getAvailability: (params: {
    providerId?: number;
    procedureId?: number;
    startDate: string;
    endDate?: string;
    durationMinutes?: number;
  }) => Promise<AvailabilityResponse>;
  getUserAppointments: () => Promise<{ success: boolean; appointments?: any[]; error?: string }>;
  cancelAppointment: (appointmentId: number, cancellationReason?: string) => Promise<{ success: boolean; error?: string }>;
  rescheduleAppointment: (appointmentId: number, newDate: string, newTime: string, providerId?: number) => Promise<{ success: boolean; error?: string }>;
  getProviders: () => Promise<{ success: boolean; providers?: any[]; error?: string }>;
  getProcedures: () => Promise<{ success: boolean; procedures?: any[]; error?: string }>;
  getProcedureCategories: () => Promise<{ success: boolean; categories?: any[]; error?: string }>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const { client } = useSupabase();
  const functionsUrl = getFunctionsUrl();

  const getAuthHeaders = (): HeadersInit => {
    return getAuthHeadersUtil();
  };

  const bookAppointment = async (appointmentData: BookAppointmentRequest): Promise<AppointmentResponse> => {
    try {
      const response = await fetch(`${functionsUrl}/book-appointment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to book appointment',
      };
    }
  };

  const getAvailability = async (params: {
    providerId?: number;
    procedureId?: number;
    startDate: string;
    endDate?: string;
    durationMinutes?: number;
  }): Promise<AvailabilityResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params.providerId) searchParams.append('providerId', params.providerId.toString());
      if (params.procedureId) searchParams.append('procedureId', params.procedureId.toString());
      searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.durationMinutes) searchParams.append('durationMinutes', params.durationMinutes.toString());

      const response = await fetch(`${functionsUrl}/get-availability?${searchParams}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get availability');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        availability: [],
        providers: [],
        error: error instanceof Error ? error.message : 'Failed to get availability',
      };
    }
  };

  const getUserAppointments = async (): Promise<{ success: boolean; appointments?: any[]; error?: string }> => {
    try {
      const { data: { session } } = await getSessionCached(client);
      if (!session?.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${functionsUrl}/manage-appointments?patientEmail=${encodeURIComponent(session.user.email!)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get appointments');
      }

      return { success: true, appointments: result.appointments || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get appointments',
      };
    }
  };

  const cancelAppointment = async (
    appointmentId: number,
    cancellationReason?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel appointment',
      };
    }
  };

  const rescheduleAppointment = async (
    appointmentId: number,
    newDate: string,
    newTime: string,
    providerId?: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (providerId) {
        const availability = await getAvailability({
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

      const response = await fetch(`${functionsUrl}/manage-appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reschedule appointment',
      };
    }
  };

  const getProviders = async (): Promise<{ success: boolean; providers?: any[]; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-providers`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get providers');
      }

      return { success: true, providers: result.providers || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get providers',
      };
    }
  };

  const getProcedures = async (): Promise<{ success: boolean; procedures?: any[]; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-procedures`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get procedures');
      }

      return { success: true, procedures: result.procedures || [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get procedures',
      };
    }
  };

  const getProcedureCategories = async (): Promise<{ success: boolean; categories?: any[]; error?: string }> => {
    try {
      const response = await fetch(`${functionsUrl}/manage-procedures`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get procedure categories',
      };
    }
  };

  const value: BookingContextType = {
    bookAppointment,
    getAvailability,
    getUserAppointments,
    cancelAppointment,
    rescheduleAppointment,
    getProviders,
    getProcedures,
    getProcedureCategories,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export default BookingContext;