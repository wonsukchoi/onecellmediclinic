# OneCell Medical Clinic Project Information

This document contains essential information about the project for reference when using AI coding tools.

## Git Repository

- Repository URL: https://github.com/wonsukchoi/onecellmediclinic.git
- Main branch: main
- Push command: `git push origin main`

## Supabase Information

The project uses Supabase for backend services. Key information:

### Supabase Configuration

Supabase configuration can be found in:
- `src/services/supabase.ts` - Main client configuration
- `supabase/config.toml` - Supabase project configuration
- `supabase/functions/` - Edge functions directory

### Database Schema

Database schema setup scripts are located in:
- `scripts/master-database-setup.sql` - Main database setup
- `scripts/cms-schema-setup.sql` - CMS schema
- `scripts/member-schema-setup.sql` - Member system schema

### Authentication

Authentication is handled through the MemberContext:
- `src/contexts/MemberContext.tsx` - Manages user authentication state
- `src/services/member.service.ts` - Member-related API calls

### Key Services

- `src/services/cms.service.ts` - CMS content management
- `src/services/booking.service.ts` - Booking and reservation system
- `src/services/consultation.service.ts` - Online consultation services
- `src/services/features.service.ts` - Clinic features and services

## Project Structure

- React + TypeScript frontend
- Vite as build tool
- Supabase for backend (auth, database, storage, edge functions)
- i18n for internationalization (Korean and English)

## Development Notes

- The project uses a component-based architecture
- CSS modules for styling (no global CSS frameworks)
- Navigation system is content-managed through Supabase
- Authentication shows different UI elements for logged-in vs non-logged-in users

## Recent Changes

- Replaced reservation button with login/signup button in header for non-logged in users
- Login/signup button styling matches language switcher text size
