import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../config/supabase';
import { bookingService, TimeSlot, Provider, AvailabilityResponse } from '../services/booking.service';

interface UseAvailabilityOptions {
  providerId?: number;
  procedureId?: number;
  startDate?: string;
  endDate?: string;
  durationMinutes?: number;
  autoFetch?: boolean;
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
}

export function useAvailability(options: UseAvailabilityOptions = {}): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<TimeSlot[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    providerId,
    procedureId,
    startDate,
    endDate,
    durationMinutes = 60,
    autoFetch = true,
  } = options;

  const fetchAvailability = useCallback(async () => {
    if (!startDate && autoFetch) {
      // Set default start date to today if auto-fetch is enabled
      const today = new Date();
      const defaultStartDate = today.toISOString().split('T')[0];
      return;
    }

    if (!startDate) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result: AvailabilityResponse = await bookingService.getAvailability({
        providerId,
        procedureId,
        startDate,
        endDate,
        durationMinutes,
      });

      if (result.success) {
        setAvailability(result.availability);
        setProviders(result.providers);
      } else {
        setError(result.error || 'Failed to fetch availability');
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, [providerId, procedureId, startDate, endDate, durationMinutes, autoFetch]);

  // Auto-fetch when parameters change
  useEffect(() => {
    if (autoFetch && startDate) {
      fetchAvailability();
    }
  }, [autoFetch, fetchAvailability, startDate]);

  // Set up real-time subscription for availability changes
  useEffect(() => {
    if (!startDate) return;

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
          // Refresh availability when appointment slots change
          fetchAvailability();
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
          // Refresh availability when appointments are created/updated/cancelled
          fetchAvailability();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAvailability, startDate]);

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
    loading,
    error,
    fetchAvailability,
    getAvailableSlotsForDate,
    getProviderAvailability,
    isTimeSlotAvailable,
    refreshAvailability,
    // Additional computed values
    groupedAvailability,
    availableDates,
  } as UseAvailabilityReturn & {
    groupedAvailability: Record<string, TimeSlot[]>;
    availableDates: string[];
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

export function useProviderSchedule(providerId?: number): UseProviderScheduleReturn {
  const [schedule, setSchedule] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!providerId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('appointment_availability')
        .select('*')
        .eq('provider_id', providerId)
        .order('date')
        .order('start_time');

      if (fetchError) {
        throw fetchError;
      }

      const formattedSchedule: AvailabilitySlot[] = (data || []).map((item) => ({
        id: item.id,
        providerId: item.provider_id,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        slotDurationMinutes: item.slot_duration_minutes,
        maxBookings: item.max_bookings,
        available: item.available,
        blockedReason: item.blocked_reason,
      }));

      setSchedule(formattedSchedule);
    } catch (err) {
      console.error('Error fetching provider schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const addAvailabilitySlot = async (slot: Omit<AvailabilitySlot, 'id'>) => {
    try {
      const { error: insertError } = await supabase
        .from('appointment_availability')
        .insert([
          {
            provider_id: slot.providerId,
            date: slot.date,
            start_time: slot.startTime,
            end_time: slot.endTime,
            slot_duration_minutes: slot.slotDurationMinutes,
            max_bookings: slot.maxBookings,
            available: slot.available,
            blocked_reason: slot.blockedReason,
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      await fetchSchedule();
    } catch (err) {
      console.error('Error adding availability slot:', err);
      throw err;
    }
  };

  const updateAvailabilitySlot = async (id: number, updates: Partial<AvailabilitySlot>) => {
    try {
      const updateData: any = {};
      if (updates.date) updateData.date = updates.date;
      if (updates.startTime) updateData.start_time = updates.startTime;
      if (updates.endTime) updateData.end_time = updates.endTime;
      if (updates.slotDurationMinutes) updateData.slot_duration_minutes = updates.slotDurationMinutes;
      if (updates.maxBookings) updateData.max_bookings = updates.maxBookings;
      if (updates.available !== undefined) updateData.available = updates.available;
      if (updates.blockedReason) updateData.blocked_reason = updates.blockedReason;

      const { error: updateError } = await supabase
        .from('appointment_availability')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      await fetchSchedule();
    } catch (err) {
      console.error('Error updating availability slot:', err);
      throw err;
    }
  };

  const deleteAvailabilitySlot = async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('appointment_availability')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      await fetchSchedule();
    } catch (err) {
      console.error('Error deleting availability slot:', err);
      throw err;
    }
  };

  const generateWeeklySchedule = async (
    targetProviderId: number,
    startDate: string,
    weekdays: number[], // 0 = Sunday, 1 = Monday, etc.
    startTime: string,
    endTime: string,
    slotDuration: number
  ) => {
    try {
      const slots: Omit<AvailabilitySlot, 'id'>[] = [];
      const start = new Date(startDate);

      // Generate slots for 4 weeks
      for (let week = 0; week < 4; week++) {
        for (let day = 0; day < 7; day++) {
          const currentDate = new Date(start);
          currentDate.setDate(currentDate.getDate() + (week * 7) + day);

          if (weekdays.includes(currentDate.getDay())) {
            slots.push({
              providerId: targetProviderId,
              date: currentDate.toISOString().split('T')[0],
              startTime,
              endTime,
              slotDurationMinutes: slotDuration,
              maxBookings: 1,
              available: true,
            });
          }
        }
      }

      // Insert all slots
      const insertData = slots.map((slot) => ({
        provider_id: slot.providerId,
        date: slot.date,
        start_time: slot.startTime,
        end_time: slot.endTime,
        slot_duration_minutes: slot.slotDurationMinutes,
        max_bookings: slot.maxBookings,
        available: slot.available,
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from('appointment_availability')
        .insert(insertData);

      if (insertError) {
        throw insertError;
      }

      await fetchSchedule();
    } catch (err) {
      console.error('Error generating weekly schedule:', err);
      throw err;
    }
  };

  return {
    schedule,
    loading,
    error,
    addAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
    generateWeeklySchedule,
  };
}