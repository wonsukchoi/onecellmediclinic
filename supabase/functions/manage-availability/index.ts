import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface AvailabilityRequest {
  action: 'list' | 'create' | 'update' | 'delete' | 'generate_weekly';
  slotId?: number;
  providerId?: number;
  filters?: {
    providerId?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  slotData?: {
    providerId?: number;
    date?: string;
    startTime?: string;
    endTime?: string;
    slotDurationMinutes?: number;
    maxBookings?: number;
    available?: boolean;
    blockedReason?: string;
  };
  weeklyData?: {
    providerId: number;
    startDate: string;
    weekdays: number[]; // 0 = Sunday, 1 = Monday, etc.
    startTime: string;
    endTime: string;
    slotDuration: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    if (req.method === "GET") {
      // Handle GET requests for availability
      const url = new URL(req.url);
      const providerId = url.searchParams.get('providerId');
      const dateFrom = url.searchParams.get('dateFrom');
      const dateTo = url.searchParams.get('dateTo');

      let query = supabaseClient
        .from('appointment_availability')
        .select('*');

      if (providerId) {
        query = query.eq('provider_id', providerId);
      }
      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      query = query.order('date').order('start_time');

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const formattedSchedule = (data || []).map((item) => ({
        id: item.id,
        providerId: item.provider_id,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        slotDurationMinutes: item.slot_duration_minutes,
        maxBookings: item.max_bookings,
        available: item.available,
        blockedReason: item.blocked_reason,
        createdAt: item.created_at,
      }));

      return new Response(
        JSON.stringify({ success: true, schedule: formattedSchedule }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const requestData: AvailabilityRequest = await req.json();
    const { action, slotId, providerId, filters, slotData, weeklyData } = requestData;

    switch (action) {
      case 'list': {
        let query = supabaseClient
          .from('appointment_availability')
          .select('*');

        // Apply filters
        if (filters?.providerId) {
          query = query.eq('provider_id', filters.providerId);
        }
        if (filters?.dateFrom) {
          query = query.gte('date', filters.dateFrom);
        }
        if (filters?.dateTo) {
          query = query.lte('date', filters.dateTo);
        }

        query = query.order('date').order('start_time');

        const { data, error } = await query;

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const formattedSchedule = (data || []).map((item) => ({
          id: item.id,
          providerId: item.provider_id,
          date: item.date,
          startTime: item.start_time,
          endTime: item.end_time,
          slotDurationMinutes: item.slot_duration_minutes,
          maxBookings: item.max_bookings,
          available: item.available,
          blockedReason: item.blocked_reason,
          createdAt: item.created_at,
        }));

        return new Response(
          JSON.stringify({ success: true, data: formattedSchedule }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'create': {
        if (!slotData?.providerId || !slotData?.date || !slotData?.startTime || !slotData?.endTime) {
          return new Response(
            JSON.stringify({ success: false, error: "Provider ID, date, start time, and end time required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data, error } = await supabaseClient
          .from('appointment_availability')
          .insert([
            {
              provider_id: slotData.providerId,
              date: slotData.date,
              start_time: slotData.startTime,
              end_time: slotData.endTime,
              slot_duration_minutes: slotData.slotDurationMinutes || 60,
              max_bookings: slotData.maxBookings || 1,
              available: slotData.available !== undefined ? slotData.available : true,
              blocked_reason: slotData.blockedReason,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'update': {
        if (!slotId || !slotData) {
          return new Response(
            JSON.stringify({ success: false, error: "Slot ID and data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const updateData: any = {};
        if (slotData.date) updateData.date = slotData.date;
        if (slotData.startTime) updateData.start_time = slotData.startTime;
        if (slotData.endTime) updateData.end_time = slotData.endTime;
        if (slotData.slotDurationMinutes) updateData.slot_duration_minutes = slotData.slotDurationMinutes;
        if (slotData.maxBookings) updateData.max_bookings = slotData.maxBookings;
        if (slotData.available !== undefined) updateData.available = slotData.available;
        if (slotData.blockedReason) updateData.blocked_reason = slotData.blockedReason;

        const { data, error } = await supabaseClient
          .from('appointment_availability')
          .update(updateData)
          .eq('id', slotId)
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'delete': {
        if (!slotId) {
          return new Response(
            JSON.stringify({ success: false, error: "Slot ID required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { error } = await supabaseClient
          .from('appointment_availability')
          .delete()
          .eq('id', slotId);

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case 'generate_weekly': {
        if (!weeklyData?.providerId || !weeklyData?.startDate || !weeklyData?.weekdays?.length ||
            !weeklyData?.startTime || !weeklyData?.endTime || !weeklyData?.slotDuration) {
          return new Response(
            JSON.stringify({ success: false, error: "Complete weekly schedule data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const slots: any[] = [];
        const start = new Date(weeklyData.startDate);

        // Generate slots for 4 weeks
        for (let week = 0; week < 4; week++) {
          for (let day = 0; day < 7; day++) {
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + (week * 7) + day);

            if (weeklyData.weekdays.includes(currentDate.getDay())) {
              slots.push({
                provider_id: weeklyData.providerId,
                date: currentDate.toISOString().split('T')[0],
                start_time: weeklyData.startTime,
                end_time: weeklyData.endTime,
                slot_duration_minutes: weeklyData.slotDuration,
                max_bookings: 1,
                available: true,
                created_at: new Date().toISOString(),
              });
            }
          }
        }

        const { data, error } = await supabaseClient
          .from('appointment_availability')
          .insert(slots)
          .select();

        if (error) {
          return new Response(
            JSON.stringify({ success: false, error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, data, slotsCreated: slots.length }),
          {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});