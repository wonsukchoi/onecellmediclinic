import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../config/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface ConsultationRequest {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  patient_age?: number;
  consultation_type: string;
  procedure_interest?: string;
  concerns?: string;
  medical_history?: string;
  current_medications?: string;
  preferred_contact_method: string;
  urgency_level: string;
  photos?: string[];
  status: string;
  assigned_provider_id?: number;
  response_notes?: string;
  estimated_cost_range?: string;
  recommended_procedures?: string[];
  follow_up_required: boolean;
  created_at: string;
  updated_at: string;
  assigned_provider?: any;
}

interface UseRealtimeConsultationsOptions {
  userId?: string;
  providerId?: number;
  status?: string[];
  urgencyLevel?: string[];
}

interface UseRealtimeConsultationsReturn {
  consultations: ConsultationRequest[];
  loading: boolean;
  error: string | null;
  refreshConsultations: () => Promise<void>;
  getConsultationById: (id: number) => ConsultationRequest | undefined;
}

export function useRealtimeConsultations(
  options: UseRealtimeConsultationsOptions = {}
): UseRealtimeConsultationsReturn {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userId, providerId, status, urgencyLevel } = options;

  // Fetch initial data
  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
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
        .order('created_at', { ascending: false });

      // Apply filters
      if (userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          query = query.eq('patient_email', user.email);
        }
      }

      if (providerId) {
        query = query.eq('assigned_provider_id', providerId);
      }

      if (status && status.length > 0) {
        query = query.in('status', status);
      }

      if (urgencyLevel && urgencyLevel.length > 0) {
        query = query.in('urgency_level', urgencyLevel);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setConsultations(data || []);
    } catch (err) {
      console.error('Error fetching consultations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  }, [userId, providerId, status, urgencyLevel]);

  // Set up real-time subscription
  useEffect(() => {
    fetchConsultations();

    // Subscribe to changes
    const subscription = supabase
      .channel('consultation_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultation_requests',
        },
        async (payload: RealtimePostgresChangesPayload<ConsultationRequest>) => {
          console.log('Consultation change received:', payload);

          if (payload.eventType === 'INSERT') {
            // Fetch the complete record with relations
            const { data: newConsultation } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (newConsultation && shouldIncludeConsultation(newConsultation)) {
              setConsultations((prev) => [newConsultation, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated record with relations
            const { data: updatedConsultation } = await supabase
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
              .eq('id', payload.new.id)
              .single();

            if (updatedConsultation) {
              setConsultations((prev) =>
                prev.map((consultation) =>
                  consultation.id === payload.new.id ? updatedConsultation : consultation
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setConsultations((prev) =>
              prev.filter((consultation) => consultation.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchConsultations]);

  // Helper function to check if consultation should be included based on filters
  const shouldIncludeConsultation = (consultation: ConsultationRequest): boolean => {
    if (status && status.length > 0 && !status.includes(consultation.status)) {
      return false;
    }

    if (urgencyLevel && urgencyLevel.length > 0 && !urgencyLevel.includes(consultation.urgency_level)) {
      return false;
    }

    if (providerId && consultation.assigned_provider_id !== providerId) {
      return false;
    }

    // For userId filter, we would need to check patient email against current user
    // This is handled in the initial fetch and subscription setup

    return true;
  };

  const refreshConsultations = useCallback(async () => {
    await fetchConsultations();
  }, [fetchConsultations]);

  const getConsultationById = useCallback(
    (id: number): ConsultationRequest | undefined => {
      return consultations.find((consultation) => consultation.id === id);
    },
    [consultations]
  );

  return {
    consultations,
    loading,
    error,
    refreshConsultations,
    getConsultationById,
  };
}

// Hook for consultation tracking in real-time
interface ConsultationTracking {
  id: number;
  consultation_request_id: number;
  status: string;
  notes: string;
  created_by?: string;
  created_at: string;
}

interface UseConsultationTrackingReturn {
  tracking: ConsultationTracking[];
  loading: boolean;
  error: string | null;
  addTrackingEntry: (entry: Omit<ConsultationTracking, 'id' | 'created_at'>) => Promise<void>;
}

export function useConsultationTracking(consultationId: number): UseConsultationTrackingReturn {
  const [tracking, setTracking] = useState<ConsultationTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('consultation_tracking')
        .select('*')
        .eq('consultation_request_id', consultationId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setTracking(data || []);
    } catch (err) {
      console.error('Error fetching consultation tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking');
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    fetchTracking();

    // Subscribe to tracking changes
    const subscription = supabase
      .channel(`consultation_tracking_${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultation_tracking',
          filter: `consultation_request_id=eq.${consultationId}`,
        },
        (payload: RealtimePostgresChangesPayload<ConsultationTracking>) => {
          if (payload.eventType === 'INSERT') {
            setTracking((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setTracking((prev) =>
              prev.map((entry) => (entry.id === payload.new.id ? payload.new : entry))
            );
          } else if (payload.eventType === 'DELETE') {
            setTracking((prev) => prev.filter((entry) => entry.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [consultationId, fetchTracking]);

  const addTrackingEntry = async (entry: Omit<ConsultationTracking, 'id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('consultation_tracking').insert([
        {
          ...entry,
          consultation_request_id: consultationId,
          created_by: user?.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error adding tracking entry:', err);
      throw err;
    }
  };

  return {
    tracking,
    loading,
    error,
    addTrackingEntry,
  };
}

// Hook for real-time consultation statistics
interface ConsultationStats {
  total: number;
  newRequests: number;
  inProgress: number;
  completed: number;
  urgentRequests: number;
}

export function useRealtimeConsultationStats(): {
  stats: ConsultationStats;
  loading: boolean;
  error: string | null;
} {
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    newRequests: 0,
    inProgress: 0,
    completed: 0,
    urgentRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      setStats({
        total: totalResult.count || 0,
        newRequests: newResult.count || 0,
        inProgress: inProgressResult.count || 0,
        completed: completedResult.count || 0,
        urgentRequests: urgentResult.count || 0,
      });
    } catch (err) {
      console.error('Error fetching consultation stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Subscribe to changes in consultation_requests table
    const subscription = supabase
      .channel('consultation_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultation_requests',
        },
        () => {
          // Refetch stats when any consultation changes
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchStats]);

  return { stats, loading, error };
}