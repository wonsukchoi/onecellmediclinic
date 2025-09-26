# Supabase Edge Functions for OneCell Medi Clinic

This directory contains the Supabase Edge Functions for the OneCell Medical Clinic backend. These functions handle appointment booking, consultation requests, availability checking, and gallery management.

## Functions Overview

### 1. book-appointment
Handles appointment booking with availability checking and conflict prevention.

**Endpoint:** `POST /book-appointment`

**Features:**
- Validates appointment data and checks for conflicts
- Verifies provider availability using database functions
- Generates unique confirmation codes
- Supports both consultation and procedure appointments
- Real-time availability checking

### 2. consultation-request
Processes consultation requests with intelligent provider matching and urgency handling.

**Endpoint:** `POST /consultation-request`

**Features:**
- Automatic provider matching based on procedure interest
- Urgency level detection from concern keywords
- Rate limiting (one request per 24 hours per email)
- Creates tracking entries for real-time updates
- Estimated response time calculation

### 3. get-availability
Retrieves provider availability with flexible filtering options.

**Endpoint:** `GET /get-availability`

**Features:**
- Filter by provider, procedure, date range
- Dynamic time slot generation based on duration
- Real-time availability checking
- Supports different appointment durations
- Returns provider information with availability

### 4. manage-gallery
Comprehensive gallery management for before/after photos.

**Endpoint:**
- `GET /manage-gallery` - Fetch gallery items
- `POST /manage-gallery` - Create new gallery item
- `PUT /manage-gallery?id=123` - Update gallery item
- `DELETE /manage-gallery?id=123` - Delete gallery item

**Features:**
- CRUD operations for gallery items
- Patient consent validation
- Image URL validation
- Provider and procedure association
- Filtering and pagination support

## Deployment Instructions

### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Deploy Functions

Deploy all functions at once:
```bash
supabase functions deploy
```

Deploy individual functions:
```bash
supabase functions deploy book-appointment
supabase functions deploy consultation-request
supabase functions deploy get-availability
supabase functions deploy manage-gallery
```

### Set Environment Variables

Set the required environment variables for your Edge Functions:

```bash
# Set Supabase credentials (required for all functions)
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Email configuration for notifications
supabase secrets set SMTP_HOST=smtp.gmail.com
supabase secrets set SMTP_PORT=587
supabase secrets set SMTP_USER=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password

# Optional: SMS configuration for appointment reminders
supabase secrets set TWILIO_ACCOUNT_SID=your-twilio-sid
supabase secrets set TWILIO_AUTH_TOKEN=your-twilio-token
supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
```

### Database Setup

Before deploying the functions, ensure your database is set up with the enhanced schema:

1. Run the base setup:
   ```sql
   -- Copy and paste contents of scripts/database-setup.sql
   ```

2. Run the enhanced schema:
   ```sql
   -- Copy and paste contents of scripts/database-enhancements.sql
   ```

### Testing Functions

Test functions locally using the Supabase CLI:

```bash
# Start local development
supabase start

# Test individual functions
supabase functions serve book-appointment --env-file .env.local
```

Test deployed functions using curl or your frontend application:

```bash
# Test appointment booking
curl -X POST 'https://your-project.supabase.co/functions/v1/book-appointment' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "serviceType": "Consultation",
    "preferredDate": "2024-02-15",
    "preferredTime": "14:00"
  }'

# Test availability checking
curl 'https://your-project.supabase.co/functions/v1/get-availability?startDate=2024-02-15&durationMinutes=60' \
  -H 'Authorization: Bearer YOUR_ANON_KEY'
```

## Function URLs

Once deployed, your functions will be available at:

- `https://your-project.supabase.co/functions/v1/book-appointment`
- `https://your-project.supabase.co/functions/v1/consultation-request`
- `https://your-project.supabase.co/functions/v1/get-availability`
- `https://your-project.supabase.co/functions/v1/manage-gallery`

## Security Considerations

1. **Authentication**: All write operations require authentication
2. **Rate Limiting**: Consultation requests are rate-limited to prevent spam
3. **Data Validation**: All inputs are validated on the server side
4. **CORS**: Properly configured CORS headers for browser requests
5. **Row Level Security**: Database tables have RLS policies enabled

## Monitoring and Logging

Monitor your functions using the Supabase Dashboard:

1. Go to Functions section in your Supabase project dashboard
2. View invocation logs and errors
3. Monitor performance metrics
4. Set up alerts for function failures

## Troubleshooting

### Common Issues

1. **Function not found**: Ensure the function is properly deployed
2. **CORS errors**: Check that CORS headers are included in responses
3. **Database connection errors**: Verify environment variables are set correctly
4. **Authentication errors**: Ensure proper authorization headers are sent

### Debugging

Enable detailed logging in your functions:

```typescript
console.log('Debug info:', { variable: value });
```

View logs in real-time:
```bash
supabase functions logs book-appointment --follow
```

## Development Workflow

1. Make changes to function code
2. Test locally: `supabase functions serve function-name`
3. Deploy: `supabase functions deploy function-name`
4. Test in production environment
5. Monitor logs for any issues

## Contributing

When adding new functions:

1. Follow the existing code structure
2. Include proper error handling and validation
3. Add comprehensive documentation
4. Test thoroughly before deployment
5. Update this README with new function information