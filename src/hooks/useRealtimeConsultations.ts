import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useApiCall } from './useApiCall';
import { ErrorLogger } from '../utils/error-logger';

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
  enabled?: boolean; // Allow disabling the hook
}

interface UseRealtimeConsultationsReturn {
  consultations: ConsultationRequest[];
  loading: boolean;
  error: string | null;
  refreshConsultations: () => Promise<void>;
  getConsultationById: (id: number) => ConsultationRequest | undefined;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

const SUPABASE_URL = 'https://weqqkknwpgremfugcbvz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg';

export function useRealtimeConsultations(
  options: UseRealtimeConsultationsOptions = {}
): UseRealtimeConsultationsReturn {
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');

  const { userId, providerId, status, urgencyLevel, enabled = true } = options;

  // Refs for cleanup and preventing infinite loops
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Stable reference to filter options to prevent useEffect loops
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // API call for fetching consultations with retry logic
  const fetchApi = useApiCall(
    async (args: { patientEmail?: string; filters?: any }) => {
      const { patientEmail, filters } = args;

      const url = patientEmail
        ? `${SUPABASE_URL}/functions/v1/manage-consultation-requests?patientEmail=${encodeURIComponent(patientEmail)}`
        : `${SUPABASE_URL}/functions/v1/manage-consultation-requests`;

      const requestConfig: RequestInit = {
        method: patientEmail ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      };

      if (!patientEmail) {
        requestConfig.body = JSON.stringify({
          action: 'list',
          filters
        });
      }

      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.consultations && !result.data) {
        throw new Error('Invalid response format');
      }

      return result.consultations || result.data || [];
    },
    {
      retryCount: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
      onError: (error, attempt) => {
        ErrorLogger.logError(error, {
          context: 'useRealtimeConsultations.fetchConsultations',
          attempt,
          userId,
          providerId,
          status,
          urgencyLevel
        });
      },
      onRetry: (attempt, delay) => {
        console.log(`Retrying consultation fetch in ${delay}ms (attempt ${attempt})`);
      }
    }
  );

  // Get individual consultation by ID
  const getConsultationByIdApi = useApiCall(
    async (consultationId: number) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-consultation-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'get_by_id',
          consultationId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.data) {
        throw new Error('Consultation not found');
      }

      return result.data;
    },
    {
      retryCount: 2,
      retryDelay: 500,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useRealtimeConsultations.getConsultationById'
        });
      }
    }
  );

  // Fetch initial data
  const fetchConsultations = useCallback(async () => {
    if (!enabled || !mountedRef.current) return;

    try {
      setConnectionStatus('connecting');

      // Prepare filters
      const filters: any = {};
      if (providerId) filters.provider = providerId;
      if (status && status.length > 0) filters.status = status[0];

      // Check if we need user email
      let patientEmail = '';
      if (userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          patientEmail = user.email;
        }
      }

      const result = await fetchApi.execute({ patientEmail, filters });

      if (mountedRef.current && result) {
        setConsultations(result);
        setConnectionStatus('connected');
        retryCountRef.current = 0; // Reset retry count on success
      }
    } catch (error) {
      if (mountedRef.current) {
        setConnectionStatus('error');
        ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
          context: 'useRealtimeConsultations.fetchConsultations'
        });
      }
    }
  }, [enabled, userId, providerId, status, urgencyLevel, fetchApi]);

  // Helper function to check if consultation should be included based on filters
  const shouldIncludeConsultation = useCallback((consultation: ConsultationRequest): boolean => {
    const currentOptions = optionsRef.current;

    if (currentOptions.status && currentOptions.status.length > 0 &&
        !currentOptions.status.includes(consultation.status)) {
      return false;
    }

    if (currentOptions.urgencyLevel && currentOptions.urgencyLevel.length > 0 &&
        !currentOptions.urgencyLevel.includes(consultation.urgency_level)) {
      return false;
    }

    if (currentOptions.providerId && consultation.assigned_provider_id !== currentOptions.providerId) {
      return false;
    }

    return true;
  }, []);

  // Set up real-time subscription with better error handling
  const setupSubscription = useCallback(() => {
    if (!enabled || !mountedRef.current) return;

    try {
      setConnectionStatus('connecting');

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
            if (!mountedRef.current) return;

            try {
              console.log('Consultation change received:', payload.eventType, (payload.new as any)?.id || (payload.old as any)?.id);

              if (payload.eventType === 'INSERT') {
                const consultationData = await getConsultationByIdApi.execute((payload.new as any)?.id);
                if (consultationData && shouldIncludeConsultation(consultationData)) {
                  setConsultations((prev) => {
                    // Prevent duplicates
                    const exists = prev.some(c => c.id === consultationData.id);
                    return exists ? prev : [consultationData, ...prev];
                  });
                }
              } else if (payload.eventType === 'UPDATE') {
                const consultationData = await getConsultationByIdApi.execute((payload.new as any)?.id);
                if (consultationData && (payload.new as any)?.id) {
                  setConsultations((prev) =>
                    prev.map((consultation) =>
                      consultation.id === (payload.new as any)?.id ? consultationData : consultation
                    )
                  );
                }
              } else if (payload.eventType === 'DELETE') {
                setConsultations((prev) =>
                  prev.filter((consultation) => consultation.id !== (payload.old as any)?.id)
                );
              }

              setConnectionStatus('connected');
            } catch (error) {
              ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
                context: 'useRealtimeConsultations.realtimeUpdate',
                eventType: payload.eventType,
                recordId: (payload.new as any)?.id || (payload.old as any)?.id
              });
              setConnectionStatus('error');
            }
          }
        )
        .subscribe((status) => {
          if (!mountedRef.current) return;

          console.log('Subscription status:', status);

          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
            retryCountRef.current = 0;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setConnectionStatus('error');

            // Retry subscription with exponential backoff
            const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
            retryCountRef.current++;

            if (retryCountRef.current <= 5) {
              retryTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  console.log(`Retrying subscription in ${retryDelay}ms (attempt ${retryCountRef.current})`);
                  setupSubscription();
                }
              }, retryDelay);
            }
          }
        });

      subscriptionRef.current = subscription;
    } catch (error) {
      ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
        context: 'useRealtimeConsultations.setupSubscription'
      });
      setConnectionStatus('error');
    }
  }, [enabled, shouldIncludeConsultation, getConsultationByIdApi]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  // Main effect for initialization
  useEffect(() => {
    if (!enabled) return;

    fetchConsultations();
    setupSubscription();

    return cleanup;
  }, [enabled, fetchConsultations, setupSubscription, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

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
    loading: fetchApi.loading,
    error: fetchApi.error,
    refreshConsultations,
    getConsultationById,
    connectionStatus,
  };
}

// Simplified hook for consultation tracking with improved error handling
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
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // API call for fetching tracking data
  const fetchTrackingApi = useApiCall(
    async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-consultation-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'get_tracking',
          consultationId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.tracking || [];
    },
    {
      retryCount: 2,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useConsultationTracking.fetchTracking',
          consultationId
        });
      }
    }
  );

  // API call for adding tracking entries
  const addTrackingApi = useApiCall(
    async (entry: Omit<ConsultationTracking, 'id' | 'created_at'>) => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-consultation-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'add_tracking',
          consultationId,
          trackingData: {
            status: entry.status,
            notes: entry.notes
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    {
      retryCount: 1,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useConsultationTracking.addTrackingEntry',
          consultationId
        });
      }
    }
  );

  // Fetch tracking data
  const fetchTracking = useCallback(async () => {
    const result = await fetchTrackingApi.execute();
    if (mountedRef.current && result) {
      setTracking(result);
    }
  }, [fetchTrackingApi]);

  // Set up real-time subscription
  useEffect(() => {
    fetchTracking();

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
          if (!mountedRef.current) return;

          try {
            if (payload.eventType === 'INSERT') {
              setTracking((prev) => [...prev, payload.new]);
            } else if (payload.eventType === 'UPDATE') {
              setTracking((prev) =>
                prev.map((entry) => (entry.id === payload.new.id ? payload.new : entry))
              );
            } else if (payload.eventType === 'DELETE') {
              setTracking((prev) => prev.filter((entry) => entry.id !== payload.old.id));
            }
          } catch (error) {
            ErrorLogger.logError(error instanceof Error ? error : new Error(String(error)), {
              context: 'useConsultationTracking.realtimeUpdate',
              consultationId,
              eventType: payload.eventType
            });
          }
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [consultationId, fetchTracking]);

  const addTrackingEntry = useCallback(
    async (entry: Omit<ConsultationTracking, 'id' | 'created_at'>) => {
      await addTrackingApi.execute(entry);
    },
    [addTrackingApi]
  );

  return {
    tracking,
    loading: fetchTrackingApi.loading,
    error: fetchTrackingApi.error,
    addTrackingEntry,
  };
}

// Hook for real-time consultation statistics with error handling
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
  connectionStatus: 'connected' | 'disconnected' | 'error';
} {
  const [stats, setStats] = useState<ConsultationStats>({
    total: 0,
    newRequests: 0,
    inProgress: 0,
    completed: 0,
    urgentRequests: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const mountedRef = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // API call for fetching stats
  const fetchStatsApi = useApiCall(
    async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/manage-consultation-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          action: 'get_stats'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.stats || {
        total: 0,
        newRequests: 0,
        inProgress: 0,
        completed: 0,
        urgentRequests: 0,
      };
    },
    {
      retryCount: 3,
      retryDelay: 2000,
      onError: (error) => {
        ErrorLogger.logError(error, {
          context: 'useRealtimeConsultationStats.fetchStats'
        });
        setConnectionStatus('error');
      }
    }
  );

  const fetchStats = useCallback(async () => {
    const result = await fetchStatsApi.execute();
    if (mountedRef.current && result) {
      setStats(result);
      setConnectionStatus('connected');
    }
  }, [fetchStatsApi]);

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
          if (mountedRef.current) {
            // Refetch stats when any consultation changes
            fetchStats();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('error');
        }
      });

    subscriptionRef.current = subscription;

    return () => {
      mountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [fetchStats]);

  return {
    stats,
    loading: fetchStatsApi.loading,
    error: fetchStatsApi.error,
    connectionStatus
  };
}