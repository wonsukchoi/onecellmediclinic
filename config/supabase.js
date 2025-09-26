// Supabase Configuration and Client Setup
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = "https://weqqkknwpgremfugcbvz.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg";

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Contact form submissions
  async submitContactForm(formData) {
    try {
      const { data, error } = await supabase
        .from("contact_submissions")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            service_type: formData.serviceType,
            message: formData.message,
            preferred_contact: formData.preferredContact,
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return { success: false, error: error.message };
    }
  },

  // Appointment booking
  async bookAppointment(appointmentData) {
    try {
      const { data, error } = await supabase.from("appointments").insert([
        {
          patient_name: appointmentData.patientName,
          patient_email: appointmentData.patientEmail,
          patient_phone: appointmentData.patientPhone,
          service_type: appointmentData.serviceType,
          preferred_date: appointmentData.preferredDate,
          preferred_time: appointmentData.preferredTime,
          notes: appointmentData.notes,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error booking appointment:", error);
      return { success: false, error: error.message };
    }
  },

  // Blog/Content management
  async getBlogPosts(limit = 10) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      return { success: false, error: error.message };
    }
  },

  async getBlogPost(slug) {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching blog post:", error);
      return { success: false, error: error.message };
    }
  },

  // Event banners
  async getActiveEventBanners() {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("event_banners")
        .select("*")
        .eq("active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("priority", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error fetching event banners:", error);
      return { success: false, error: error.message };
    }
  },

  // User authentication helpers
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error signing up:", error);
      return { success: false, error: error.message };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error signing in:", error);
      return { success: false, error: error.message };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Error signing out:", error);
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return { success: true, user };
    } catch (error) {
      console.error("Error getting current user:", error);
      return { success: false, error: error.message };
    }
  },
};

// Auth state change listener
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};

export default supabase;
