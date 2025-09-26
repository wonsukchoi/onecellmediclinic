#!/usr/bin/env node
/**
 * Frontend Integration Verification Script
 * This script verifies that the contact form will work properly after the database fix
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (same as in the frontend)
const supabaseUrl = 'https://weqqkknwpgremfugcbvz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcXFra253cGdyZW1mdWdjYnZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NzAwNTAsImV4cCI6MjA3NDQ0NjA1MH0.llYPWCVtWr6OWI_zRFYkeYMzGqaw9nfAQKU3VUV-Fgg';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function that mimics the frontend service
async function testContactFormSubmission() {
  console.log('🧪 Testing Contact Form Integration');
  console.log('===================================');

  // Test data that mimics what the React form would send
  const testFormData = {
    name: 'Frontend Test User',
    email: 'frontend.test@example.com',
    phone: '555-0123',
    serviceType: 'dermatology', // camelCase from frontend
    message: 'This is a test submission from the frontend integration test',
    preferredContact: 'email' // camelCase from frontend
  };

  console.log('Sending data:', testFormData);
  console.log('');

  try {
    // This mimics exactly what the DatabaseService.submitContactForm does
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: testFormData.name,
          email: testFormData.email,
          phone: testFormData.phone,
          service_type: testFormData.serviceType, // Note: converted to snake_case
          message: testFormData.message,
          preferred_contact: testFormData.preferredContact // Note: converted to snake_case
        }
      ])
      .select()
      .single();

    if (error) {
      console.log('❌ Error occurred:');
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('');

      if (error.code === '42501') {
        console.log('💡 This is the RLS policy error. Run the fix SQL script first.');
      }

      return false;
    }

    console.log('✅ Success! Contact form submission worked.');
    console.log('Inserted data:', data);
    console.log('');
    console.log('🎉 The frontend integration will work properly after the database fix.');

    return true;

  } catch (error) {
    console.log('❌ Unexpected error:');
    console.log(error.message);
    return false;
  }
}

// Run the test
testContactFormSubmission()
  .then(success => {
    if (success) {
      console.log('✅ All tests passed! The contact form will work once the database is fixed.');
    } else {
      console.log('❌ Tests failed. Please apply the database fix first.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });