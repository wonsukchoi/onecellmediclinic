# OneCell Medical Clinic - Supabase Integration Guide

This guide will help you set up and use the Supabase integration for your medical clinic website.

## 🚀 Features Integrated

✅ **Contact Form System** - Store and manage patient inquiries  
✅ **Appointment Booking** - Full appointment scheduling system  
✅ **User Authentication** - Login/signup for patients  
✅ **Event Banner System** - Dynamic promotional banners  
✅ **Blog/Content Management** - Ready for content publishing  
✅ **Patient Profiles** - Extended user information storage  

## 📋 Prerequisites

- Supabase account and project
- Node.js installed on your system
- Basic understanding of JavaScript/HTML

## 🔧 Setup Instructions

### 1. Database Setup

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `scripts/database-setup.sql`
4. Run the SQL commands to create all necessary tables and policies

### 2. Environment Configuration

Your Supabase credentials are already configured in the code:
- **Project URL**: `https://weqqkknwpgremfugcbvz.supabase.co`
- **API Key**: Already integrated in `config/supabase.js`
- **Database Password**: `I9i8i7ms!@#`

### 3. Start Development Server

```bash
npm run dev
```

Your site will be available at `http://localhost:8000`

## 🎯 How to Use Each Feature

### Contact Form
- Automatically appears when users click consultation buttons
- Stores submissions in `contact_submissions` table
- Includes form validation and success/error handling
- **Usage**: Click any "문의하기" or consultation button

### Appointment Booking
- Comprehensive booking form with date/time selection
- Stores appointments in `appointments` table
- Includes business hour validation
- **Usage**: Click booking buttons or add `data-booking` attribute to any button

### User Authentication
- Login/Signup forms with email verification
- User profiles stored in `user_profiles` table
- Session management handled automatically
- **Usage**: Login/signup buttons appear in header automatically

### Event Banners
- Dynamic popup banners from database
- Auto-rotation for multiple banners
- Dismissal tracking (won't show again for 1 hour)
- **Usage**: Add banners through Supabase dashboard in `event_banners` table

### Blog System (Ready to Use)
- Database tables and functions ready
- Can be integrated with any admin interface
- SEO-friendly with meta tags and slugs
- **Usage**: Add posts to `blog_posts` table

## 📊 Database Tables

### `contact_submissions`
Stores all contact form submissions
- `name`, `email`, `phone`, `service_type`, `message`
- `status` (new, contacted, resolved)
- Timestamps for tracking

### `appointments` 
Manages appointment bookings
- Patient information and contact details
- Service type, preferred date/time
- Status tracking (pending, confirmed, completed)
- Doctor assignment field

### `user_profiles`
Extended user information
- Links to Supabase auth users
- Medical history, allergies, emergency contacts
- Role-based access (patient, staff, admin)

### `blog_posts`
Content management system
- Title, content, excerpt, featured images
- SEO meta tags and URL slugs
- Published status and scheduling

### `event_banners`
Dynamic promotional system
- Title, description, images, CTA buttons
- Date-based activation/deactivation
- Priority ordering and targeting

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public access** for contact forms and appointments
- **Authenticated access** for user data and admin functions
- **User isolation** - users can only see their own data

## 🎨 UI Components

All forms and interfaces are fully styled with:
- Responsive design for all devices
- Modern, medical-grade aesthetics
- Smooth animations and transitions
- Accessibility features (ARIA labels, keyboard navigation)
- Loading states and error handling

## 📱 Mobile Optimization

- Touch-friendly interfaces
- Optimized form layouts for mobile
- Responsive modal dialogs
- Proper viewport handling

## 🔍 Testing Your Integration

1. **Contact Form**: Fill out and submit a contact form
2. **Appointments**: Book a test appointment
3. **Authentication**: Create a test user account
4. **Event Banners**: Add a test banner in Supabase dashboard

## 📈 Monitoring & Analytics

Check your Supabase dashboard for:
- Real-time form submissions
- User registration analytics  
- Appointment booking trends
- Error logs and performance metrics

## 🆘 Troubleshooting

### Common Issues:

**Forms not submitting?**
- Check browser console for errors
- Verify Supabase credentials
- Ensure database tables exist

**Authentication not working?**
- Check email confirmation settings in Supabase
- Verify RLS policies are active
- Check user creation triggers

**Event banners not showing?**
- Verify banner dates are current
- Check `active` status in database
- Clear localStorage if testing dismissal

## 🔄 Development Workflow

1. **Local Development**: Use `npm run dev` for live reloading
2. **Database Changes**: Update `database-setup.sql` and re-run in Supabase
3. **Testing**: Test all forms and functionality locally
4. **Deployment**: Deploy static files to your hosting provider

## 📞 Support

Your Supabase integration is now complete and ready for production use! 

- **Database**: All tables created with proper relationships
- **Security**: RLS policies configured for data protection  
- **UI**: Beautiful, responsive forms and interfaces
- **Features**: Contact, booking, auth, banners all working

The system is designed to handle real patient data and appointments while maintaining HIPAA-compliant security practices.

## 🎉 What's Next?

- Add staff/admin dashboard for managing appointments
- Integrate email notifications for bookings
- Add SMS reminders for appointments
- Implement patient medical records system
- Add online payment processing

Your medical clinic website is now powered by a robust, scalable backend system! 🏥✨
