import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import { bookingService } from '../services/booking.service';
import { useApiCall } from './useApiCall';
import { ErrorLogger } from '../utils/error-logger';
import type { TimeSlot, Provider, AvailabilityResponse } from '../services/booking.service';

interface UseAvailabilityOptions {
  providerId?: number;
  procedureId?: number;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  autoFetch?: boolean;
  enabled?: boolean; // Allow disabling the hook
}

interface UseAvailabilityReturn {
  availability: TimeSlot[];
  providers: Provider[];
  loading: boolean;
  error: string | null;
  fetchAvailability: () => Promise<void>;
  getAvailableSlotsForDate: (date: string) => TimeSlot[];
  getProviderAvailability: (providerId: number) => TimeSlot[];
  isTimeSlotAvailable: (date: string, time: string, providerId?: number) => boolean;
  refreshAvailability: () => void;
  groupedAvailability: Record<string, TimeSlot[]>;
  availableDates: string[];
}

export function useAvailability(options: UseAvailabilityOptions = {}): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const {
    providerId,
    procedureId,
    startDate,
    endDate,
    durationMinutes = 60,
    autoFetch = true,
    enabled = true,
  } = options;

  // Refs for cleanup and preventing race conditions
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // API call with retry logic
  const availabilityApi = useApiCall(
    async () => {
      if (!startDate) {
        throw new Error('Start date is required');
      }

      const result: AvailabilityResponse = await bookingService.getAvailability({
        providerId,
        procedureId,
        startDate,
        endDate,
        durationMinutes,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch availability');
      }

      return result;
    },
    {
      retryCount: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      onError: (error, attempt) => {
        ErrorLogger.logError(error, {
          context: 'useAvailability.fetchAvailability',
          attempt,
          providerId,
          procedureId,
          startDate,
          endDate,
          durationMinutes
        });
      },
      onRetry: (attempt, delay) => {
        console.log(`Retrying availability fetch in ${delay}ms (attempt ${attempt})`);
      }
    }
  );

  // Fetch availability function
  const fetchAvailability = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    if (!startDate) {
      if (autoFetch) {
        // Could set a default date here if needed
        return;
      }
      return;
    }

    try {
      const result = await availabilityApi.execute();

      if (mountedRef.current && result) {
        setAvailability(result.availability);
        setProviders(result.providers);
      }
    } catch (error) {
      ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'useAvailability.fetchAvailability',
        providerId,
        procedureId,
        startDate,
        endDate
      });
    }
  }, [enabled, providerId, procedureId, startDate, endDate, durationMinutes, autoFetch, availabilityApi]);

  // Auto-fetch when parameters change
  useEffect(() => {
    if (enabled && autoFetch && startDate) {
      fetchAvailability();
    }
  }, [enabled, autoFetch, startDate, fetchAvailability]);

  // Set up real-time subscription for availability changes with cleanup
  useEffect(() => {
    if (!enabled || !startDate || !mountedRef.current) return;

    try {
      const subscription = supabase
        .channel('availability_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointment_availability',
          },
          () => {
            if (mountedRef.current) {
              console.log('Availability changed, refreshing...');
              fetchAvailability();
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
          },
          () => {
            if (mountedRef.current) {
              console.log('Appointments changed, refreshing availability...');
              fetchAvailability();
            }
          }
        )
        .subscribe((status) => {
          console.log('Availability subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            ErrorLogger.logError(new Error('Availability subscription error'), {
              context: 'useAvailability.subscription',
              status
            });
          }
        });

      subscriptionRef.current = subscription;
    } catch (error) {
      ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'useAvailability.setupSubscription'
      });
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, startDate, fetchAvailability]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  // Memoized helper functions
  const getAvailableSlotsForDate = useCallback(
    (date: string): TimeSlot[] => {
      return availability.filter((slot) => slot.date === date && slot.available);
    },
    [availability]
  );

  const getProviderAvailability = useCallback(
    (targetProviderId: number): TimeSlot[] => {
      return availability.filter((slot) => slot.providerId === targetProviderId);
    },
    [availability]
  );

  const isTimeSlotAvailable = useCallback(
    (date: string, time: string, targetProviderId?: number): boolean => {
      const slots = availability.filter((slot) => {
        const matchesDate = slot.date === date;
        const matchesTime = slot.startTime === time || slot.startTime <= time && slot.endTime > time;
        const matchesProvider = !targetProviderId || slot.providerId === targetProviderId;
        return matchesDate && matchesTime && matchesProvider && slot.available;
      });
      return slots.length > 0;
    },
    [availability]
  );

  const refreshAvailability = useCallback(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Memoized grouped availability data
  const groupedAvailability = useMemo(() => {
    const grouped: Record<string, TimeSlot[]> = {};
    availability.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [availability]);

  const availableDates = useMemo(() => {
    return Object.keys(groupedAvailability).filter(
      (date) => groupedAvailability[date].some((slot) => slot.available)
    );
  }, [groupedAvailability]);

  return {
    availability,
    providers,
    loading: availabilityApi.loading,
    error: availabilityApi.error,
    fetchAvailability,
    getAvailableSlotsForDate,
    getProviderAvailability,
    isTimeSlotAvailable,
    refreshAvailability,
    groupedAvailability,
    availableDates,
  };
}

// Hook for managing provider schedules (admin/provider use)
interface AvailabilitySlot {
  id?: number;
  providerId: number;
  date: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  maxBookings: number;
  available: boolean;
  blockedReason?: string;
}

interface UseProviderScheduleReturn {
  schedule: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  addAvailabilitySlot: (slot: Omit<AvailabilitySlot, 'id'>) => Promise<void>;
  updateAvailabilitySlot: (id: number, updates: Partial<AvailabilitySlot>) => Promise<void>;
  deleteAvailabilitySlot: (id: number) => Promise<void>;
  generateWeeklySchedule: (
    providerId: number,
    startDate: string,
    weekdays: number[],
    startTime: string,
    endTime: string,
    slotDuration: number
  ) => Promise<void>;
}

const SUPABASE_URL = 'https://weqqkknwpgremfugcbvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg';

export function useProviderSchedule(providerId?: number): UseProviderScheduleReturn {
  const [schedule, setSchedule] = useState<AvailabilitySlot[]>([]);
  const mountedRef = useRef(true);

  // API calls with enhanced error handling
  const fetchScheduleApi = useApiCall(
    async () => {
      if (!providerId) {
        throw new Error('Provider ID is required');
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-availability?providerId=${providerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.schedule || [];
    },
    {
      retryCount: 2,
      retryDelay: 1000,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useProviderSchedule.fetchSchedule',
          providerId
        });
      }
    }
  );

  const modifyScheduleApi = useApiCall(
    async ({ action, data }: { action: string; data: any }) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    {
      retryCount: 1, // Don't retry mutations multiple times
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useProviderSchedule.modifySchedule',
          providerId
        });
      }
    }
  );

  // Fetch schedule
  const fetchSchedule = useCallback(async () => {
    if (!providerId || !mountedRef.current) return;

    const result = await fetchScheduleApi.execute();
    if (mountedRef.current && result) {
      setSchedule(result);
    }
  }, [providerId, fetchScheduleApi]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const addAvailabilitySlot = useCallback(async (slot: Omit<AvailabilitySlot, 'id'>) => {
    await modifyScheduleApi.execute({
      action: 'create',
      data: { slotData: slot }
    });
    await fetchSchedule();
  }, [modifyScheduleApi, fetchSchedule]);

  const updateAvailabilitySlot = useCallback(async (id: number, updates: Partial<AvailabilitySlot>) => {
    await modifyScheduleApi.execute({
      action: 'update',
      data: { slotId: id, slotData: updates }
    });
    await fetchSchedule();
  }, [modifyScheduleApi, fetchSchedule]);

  const deleteAvailabilitySlot = useCallback(async (id: number) => {
    await modifyScheduleApi.execute({
      action: 'delete',
      data: { slotId: id }
    });
    await fetchSchedule();
  }, [modifyScheduleApi, fetchSchedule]);

  const generateWeeklySchedule = useCallback(async (
    targetProviderId: number,
    startDate: string,
    weekdays: number[],
    startTime: string,
    endTime: string,
    slotDuration: number
  ) => {
    await modifyScheduleApi.execute({
      action: 'generate_weekly',
      data: {
        weeklyData: {
          providerId: targetProviderId,
          startDate,
          weekdays,
          startTime,
          endTime,
          slotDuration
        }
      }
    });
    await fetchSchedule();
  }, [modifyScheduleApi, fetchSchedule]);

  return {
    schedule,
    loading: fetchScheduleApi.loading || modifyScheduleApi.loading,
    error: fetchScheduleApi.error || modifyScheduleApi.error,
    addAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    generateWeeklySchedule,
  };
}