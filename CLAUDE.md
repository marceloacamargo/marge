# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marge is an AI-powered appointment booking system that provides natural language conversation for booking, cancelling, and managing appointments. It serves healthcare and beauty/wellness businesses with a chat-based interface powered by OpenAI GPT-4 and a comprehensive admin dashboard.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle with Turbopack  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Setup
Environment variables must be configured in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `NEXT_PUBLIC_APP_URL` - Application URL (default: http://localhost:3000)

### Database Setup
Run the SQL schema from `database/schema.sql` in your Supabase SQL editor to create:
- `businesses` table with sample data
- `clients` table with email uniqueness constraints
- `appointments` table with status tracking
- `chat_sessions` table for conversation history
- Required indexes and triggers

## Architecture Overview

### Core System Flow
The application follows a three-layer architecture:

1. **Chat Interface** → **OpenAI Function Calling** → **Booking Service** → **Database**
2. **Admin Dashboard** → **API Routes** → **Database**
3. **Client Widget** → **Chat API** → **OpenAI + Booking Logic**

### Key Services

**BookingService** (`src/lib/booking-logic.ts`)
- Central business logic for all appointment operations
- Static methods for availability checking, booking, cancellation
- Handles client recognition and creation
- Enforces business rules (30-day advance booking, 4-hour notice, business hours)

**Chat Handler** (`src/lib/chat-handler.ts`)  
- OpenAI GPT-4 integration with function calling
- Marge personality system prompt with dynamic business info replacement
- Four core functions: `check_availability`, `book_appointment`, `cancel_appointment`, `find_client_appointments`
- Context-aware conversation management

### API Architecture

**Chat Endpoint** (`/api/chat`)
- Processes natural language through OpenAI
- Executes function calls via BookingService
- Handles conversation context and error responses
- Returns formatted responses for the chat widget

**Appointments API** (`/api/appointments`)
- CRUD operations for appointment management
- Supports filtering by business, date, and status
- Batch operations for admin dashboard

**Availability API** (`/api/availability`)
- Real-time slot checking with business hours validation
- Time preference filtering (morning/afternoon/evening)
- Date range restrictions (30-day limit, no past dates)

### Data Model Relationships

- `Business` → has many `Appointments` and `Clients`
- `Client` → belongs to `Business`, has many `Appointments`
- `Appointment` → belongs to `Business` and `Client`
- `ChatSession` → belongs to `Business`, optionally to `Client`

### Frontend Components

**Chat System**
- `ChatWidget` - Main chat interface with conversation state
- `ChatBubble` - Individual message rendering with timestamps
- `MargeAvatar` - Consistent AI assistant branding

**Dashboard System**
- `CalendarView` - Interactive calendar with appointment details
- `AppointmentList` - Tabular view with status management
- `ClientList` - Client management with search functionality
- `StatsCard` - Business metrics dashboard

## Business Logic Rules

### Appointment Constraints
- 1-hour appointment duration (fixed)
- Business hours enforcement per day of week
- No double-booking (one appointment per time slot)
- 30-day advance booking limit
- 4-hour minimum notice for new bookings

### Marge AI Personality
- Professional but warm tone
- Escalates complex questions to human staff
- Uses client names for personalization
- Maintains conversation context across messages
- Handles errors gracefully with helpful alternatives

### Client Management
- Automatic client creation on first booking
- Email-based client identification for cancellations
- Preference and history tracking
- Statistics updates (total appointments, last visit)

## Key Configuration

### Demo Business ID
The application uses `00000000-0000-0000-0000-000000000001` as the hardcoded business ID for MVP testing. In production, this should be replaced with proper authentication and multi-tenancy.

### ESLint Configuration
Custom rules in `.eslintrc.json` treat certain warnings as warnings rather than errors for development efficiency, particularly around React hooks dependencies and unused variables.

### Type Safety
All database interactions use TypeScript interfaces from `src/types/index.ts`. The `BusinessHours` interface includes an index signature to work with dynamic hour formatting.

## Database Considerations

### Supabase Integration
- Uses `supabaseAdmin` client for server-side operations with elevated permissions
- Row Level Security (RLS) enabled on all tables
- Automatic timestamp triggers for `updated_at` fields
- UUID primary keys with proper foreign key relationships

### Performance Optimizations
- Indexes on frequently queried fields (`business_id`, `date`, `email`)
- Query optimization for availability checking
- Efficient filtering for dashboard views