import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface AvailabilityRequest {
  providerId?: number;
  procedureId?: number;
  startDate: string;
  endDate?: string;
  durationMinutes?: number;
}

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  providerId: number;
  providerName: string;
  currentBookings: number;
  maxBookings: number;
}

interface AvailabilityResponse {
  success: boolean;
  availability?: TimeSlot[];
  providers?: any[];
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    if (req.method !== "GET") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const providerId = url.searchParams.get("providerId");
    const procedureId = url.searchParams.get("procedureId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const durationMinutes = parseInt(url.searchParams.get("durationMinutes") || "60");

    // Validate required parameters
    if (!startDate) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "startDate parameter is required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate date format
    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid startDate format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set default end date if not provided (7 days from start)
    const endDateObj = endDate ? new Date(endDate) : new Date(startDateObj);
    if (!endDate) {
      endDateObj.setDate(endDateObj.getDate() + 7);
    }

    // Ensure we're not looking too far back
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDateObj < today) {
      return new Response(
        JSON.stringify({ success: false, error: "Cannot check availability for past dates" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let availabilityQuery = supabaseClient
      .from('appointment_availability')
      .select(`
        *,
        providers!inner(
          id,
          full_name,
          title,
          specialization,
          active
        )
      `)
      .gte('date', startDate)
      .lte('date', endDateObj.toISOString().split('T')[0])
      .eq('available', true)
      .eq('providers.active', true)
      .order('date')
      .order('start_time');

    // Filter by provider if specified
    if (providerId && !isNaN(parseInt(providerId))) {
      availabilityQuery = availabilityQuery.eq('provider_id', parseInt(providerId));
    }

    // If procedure is specified, only show providers who perform that procedure
    if (procedureId && !isNaN(parseInt(procedureId))) {
      const { data: procedureProviders } = await supabaseClient
        .from('procedure_providers')
        .select('provider_id')
        .eq('procedure_id', parseInt(procedureId));

      if (procedureProviders && procedureProviders.length > 0) {
        const providerIds = procedureProviders.map(pp => pp.provider_id);
        availabilityQuery = availabilityQuery.in('provider_id', providerIds);
      } else {
        // No providers for this procedure
        return new Response(
          JSON.stringify({
            success: true,
            availability: [],
            providers: []
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const { data: availabilityData, error: availabilityError } = await availabilityQuery;

    if (availabilityError) {
      console.error("Availability query error:", availabilityError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error fetching availability data"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Process availability data to generate time slots
    const timeSlots: TimeSlot[] = [];
    const providersMap = new Map();

    for (const slot of availabilityData || []) {
      // Store provider info
      if (!providersMap.has(slot.provider_id)) {
        providersMap.set(slot.provider_id, slot.providers);
      }

      // Generate time slots based on duration
      const slotStart = new Date(`${slot.date}T${slot.start_time}`);
      const slotEnd = new Date(`${slot.date}T${slot.end_time}`);
      const slotDuration = slot.slot_duration_minutes || 60;

      let currentTime = new Date(slotStart);
      while (currentTime < slotEnd) {
        const slotEndTime = new Date(currentTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + Math.max(durationMinutes, slotDuration));

        // Check if this time slot fits within the availability window
        if (slotEndTime <= slotEnd) {
          // Check if there are any conflicting appointments
          const timeString = currentTime.toTimeString().slice(0, 8);

          // This would ideally use the check_provider_availability function
          // For now, we'll use the current_bookings vs max_bookings check
          const isAvailable = slot.current_bookings < slot.max_bookings;

          timeSlots.push({
            date: slot.date,
            startTime: timeString,
            endTime: slotEndTime.toTimeString().slice(0, 8),
            available: isAvailable,
            providerId: slot.provider_id,
            providerName: slot.providers.full_name,
            currentBookings: slot.current_bookings,
            maxBookings: slot.max_bookings
          });
        }

        // Move to next time slot
        currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
      }
    }

    // Get list of unique providers
    const providers = Array.from(providersMap.values()).map(provider => ({
      id: provider.id,
      name: provider.full_name,
      title: provider.title,
      specialization: provider.specialization
    }));

    // Filter out past time slots (in case of same-day bookings)
    const now = new Date();
    const filteredTimeSlots = timeSlots.filter(slot => {
      const slotDateTime = new Date(`${slot.date}T${slot.startTime}`);
      return slotDateTime > now;
    });

    const response: AvailabilityResponse = {
      success: true,
      availability: filteredTimeSlots,
      providers: providers
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/* Example request URL:
GET /get-availability?startDate=2024-02-15&endDate=2024-02-22&providerId=1&durationMinutes=60

Example response:
{
  "success": true,
  "availability": [
    {
      "date": "2024-02-15",
      "startTime": "09:00:00",
      "endTime": "10:00:00",
      "available": true,
      "providerId": 1,
      "providerName": "Dr. Jane Smith",
      "currentBookings": 0,
      "maxBookings": 1
    },
    {
      "date": "2024-02-15",
      "startTime": "10:00:00",
      "endTime": "11:00:00",
      "available": true,
      "providerId": 1,
      "providerName": "Dr. Jane Smith",
      "currentBookings": 0,
      "maxBookings": 1
    }
  ],
  "providers": [
    {
      "id": 1,
      "name": "Dr. Jane Smith",
      "title": "Plastic Surgeon",
      "specialization": "Facial Surgery"
    }
  ]
}

For procedure-specific availability:
GET /get-availability?startDate=2024-02-15&procedureId=2&durationMinutes=180

This would return only providers who perform procedure ID 2, with time slots that accommodate the 180-minute duration.
*/