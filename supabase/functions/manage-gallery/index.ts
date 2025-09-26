import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders } from "../_shared/cors.ts";

interface GalleryItem {
  id?: number;
  procedureId: number;
  providerId?: number;
  title?: string;
  description?: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  additionalImages?: string[];
  patientAgeRange?: string;
  procedureDate?: string;
  recoveryWeeks?: number;
  patientTestimonial?: string;
  consentGiven: boolean;
  featured?: boolean;
  displayOrder?: number;
  tags?: string[];
}

interface GalleryResponse {
  success: boolean;
  data?: any;
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

    // Check authentication for write operations
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (req.method !== "GET" && (!user || authError)) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);

    switch (req.method) {
      case "GET":
        return await handleGet(supabaseClient, url);
      case "POST":
        return await handlePost(supabaseClient, req);
      case "PUT":
        return await handlePut(supabaseClient, req, url);
      case "DELETE":
        return await handleDelete(supabaseClient, url);
      default:
        return new Response(
          JSON.stringify({ success: false, error: "Method not allowed" }),
          {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

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

async function handleGet(supabaseClient: any, url: URL): Promise<Response> {
  const procedureId = url.searchParams.get("procedureId");
  const providerId = url.searchParams.get("providerId");
  const featured = url.searchParams.get("featured");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = parseInt(url.searchParams.get("offset") || "0");
  const itemId = url.searchParams.get("id");

  let query = supabaseClient
    .from('gallery_items')
    .select(`
      *,
      procedures!inner(
        id,
        name,
        slug
      ),
      providers(
        id,
        full_name,
        title,
        specialization
      )
    `)
    .eq('consent_given', true)
    .order('featured', { ascending: false })
    .order('display_order')
    .order('created_at', { ascending: false });

  // Apply filters
  if (itemId) {
    query = query.eq('id', parseInt(itemId));
  }

  if (procedureId) {
    query = query.eq('procedure_id', parseInt(procedureId));
  }

  if (providerId) {
    query = query.eq('provider_id', parseInt(providerId));
  }

  if (featured === 'true') {
    query = query.eq('featured', true);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data: galleryItems, error: queryError } = await query;

  if (queryError) {
    console.error("Gallery query error:", queryError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Error fetching gallery items"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Get total count for pagination
  let countQuery = supabaseClient
    .from('gallery_items')
    .select('*', { count: 'exact', head: true })
    .eq('consent_given', true);

  if (procedureId) countQuery = countQuery.eq('procedure_id', parseInt(procedureId));
  if (providerId) countQuery = countQuery.eq('provider_id', parseInt(providerId));
  if (featured === 'true') countQuery = countQuery.eq('featured', true);

  const { count, error: countError } = await countQuery;

  const response: GalleryResponse = {
    success: true,
    data: {
      items: galleryItems || [],
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    }
  };

  return new Response(
    JSON.stringify(response),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handlePost(supabaseClient: any, req: Request): Promise<Response> {
  const galleryItem: GalleryItem = await req.json();

  // Validate required fields
  const { procedureId, beforeImageUrl, afterImageUrl, consentGiven } = galleryItem;
  if (!procedureId || !beforeImageUrl || !afterImageUrl || consentGiven !== true) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing required fields: procedureId, beforeImageUrl, afterImageUrl, and consentGiven must be true"
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Validate URLs
  const urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(beforeImageUrl) || !urlRegex.test(afterImageUrl)) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid image URLs" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Validate additional image URLs if provided
  if (galleryItem.additionalImages) {
    for (const url of galleryItem.additionalImages) {
      if (!urlRegex.test(url)) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid additional image URL: " + url }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
  }

  // Check if procedure exists
  const { data: procedure, error: procedureError } = await supabaseClient
    .from('procedures')
    .select('id, name')
    .eq('id', procedureId)
    .single();

  if (procedureError || !procedure) {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid procedure ID" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Check provider if specified
  if (galleryItem.providerId) {
    const { data: provider, error: providerError } = await supabaseClient
      .from('providers')
      .select('id, full_name')
      .eq('id', galleryItem.providerId)
      .single();

    if (providerError || !provider) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid provider ID" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }

  // Prepare data for insertion
  const insertData = {
    procedure_id: procedureId,
    provider_id: galleryItem.providerId,
    title: galleryItem.title,
    description: galleryItem.description,
    before_image_url: beforeImageUrl,
    after_image_url: afterImageUrl,
    additional_images: galleryItem.additionalImages || [],
    patient_age_range: galleryItem.patientAgeRange,
    procedure_date: galleryItem.procedureDate,
    recovery_weeks: galleryItem.recoveryWeeks,
    patient_testimonial: galleryItem.patientTestimonial,
    consent_given: true, // Always true for POST requests
    featured: galleryItem.featured || false,
    display_order: galleryItem.displayOrder || 0,
    tags: galleryItem.tags || [],
    created_at: new Date().toISOString()
  };

  const { data: newItem, error: insertError } = await supabaseClient
    .from('gallery_items')
    .insert([insertData])
    .select(`
      *,
      procedures!inner(
        id,
        name,
        slug
      ),
      providers(
        id,
        full_name,
        title,
        specialization
      )
    `)
    .single();

  if (insertError) {
    console.error("Insert error:", insertError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to create gallery item. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const response: GalleryResponse = {
    success: true,
    data: newItem
  };

  return new Response(
    JSON.stringify(response),
    {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handlePut(supabaseClient: any, req: Request, url: URL): Promise<Response> {
  const itemId = url.searchParams.get("id");
  if (!itemId || isNaN(parseInt(itemId))) {
    return new Response(
      JSON.stringify({ success: false, error: "Valid item ID required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const updateData = await req.json();

  // Remove fields that shouldn't be updated directly
  delete updateData.id;
  delete updateData.created_at;
  delete updateData.procedures;
  delete updateData.providers;

  // Convert camelCase to snake_case for database
  const dbUpdateData: any = {};
  const fieldMapping = {
    procedureId: 'procedure_id',
    providerId: 'provider_id',
    beforeImageUrl: 'before_image_url',
    afterImageUrl: 'after_image_url',
    additionalImages: 'additional_images',
    patientAgeRange: 'patient_age_range',
    procedureDate: 'procedure_date',
    recoveryWeeks: 'recovery_weeks',
    patientTestimonial: 'patient_testimonial',
    consentGiven: 'consent_given',
    displayOrder: 'display_order'
  };

  for (const [camelKey, value] of Object.entries(updateData)) {
    const dbKey = fieldMapping[camelKey as keyof typeof fieldMapping] || camelKey;
    if (value !== undefined) {
      dbUpdateData[dbKey] = value;
    }
  }

  dbUpdateData.updated_at = new Date().toISOString();

  const { data: updatedItem, error: updateError } = await supabaseClient
    .from('gallery_items')
    .update(dbUpdateData)
    .eq('id', parseInt(itemId))
    .select(`
      *,
      procedures!inner(
        id,
        name,
        slug
      ),
      providers(
        id,
        full_name,
        title,
        specialization
      )
    `)
    .single();

  if (updateError) {
    console.error("Update error:", updateError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to update gallery item. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  if (!updatedItem) {
    return new Response(
      JSON.stringify({ success: false, error: "Gallery item not found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const response: GalleryResponse = {
    success: true,
    data: updatedItem
  };

  return new Response(
    JSON.stringify(response),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

async function handleDelete(supabaseClient: any, url: URL): Promise<Response> {
  const itemId = url.searchParams.get("id");
  if (!itemId || isNaN(parseInt(itemId))) {
    return new Response(
      JSON.stringify({ success: false, error: "Valid item ID required" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const { error: deleteError } = await supabaseClient
    .from('gallery_items')
    .delete()
    .eq('id', parseInt(itemId));

  if (deleteError) {
    console.error("Delete error:", deleteError);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to delete gallery item. Please try again."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const response: GalleryResponse = {
    success: true,
    data: { message: "Gallery item deleted successfully" }
  };

  return new Response(
    JSON.stringify(response),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/* Example Usage:

GET /manage-gallery?procedureId=1&limit=10&offset=0
- Get gallery items for a specific procedure

GET /manage-gallery?featured=true
- Get featured gallery items

POST /manage-gallery
Body:
{
  "procedureId": 1,
  "providerId": 2,
  "title": "Rhinoplasty Results - 6 months post-op",
  "description": "Successful rhinoplasty with natural-looking results",
  "beforeImageUrl": "https://example.com/before.jpg",
  "afterImageUrl": "https://example.com/after.jpg",
  "additionalImages": ["https://example.com/side-view.jpg"],
  "patientAgeRange": "25-30",
  "procedureDate": "2024-01-15",
  "recoveryWeeks": 8,
  "patientTestimonial": "I'm so happy with my results!",
  "consentGiven": true,
  "featured": true,
  "tags": ["rhinoplasty", "nose-job", "facial-surgery"]
}

PUT /manage-gallery?id=123
Body:
{
  "title": "Updated title",
  "featured": false
}

DELETE /manage-gallery?id=123
*/