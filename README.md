# 🤖 Marge - AI Receptionist Appointment System

> "The AI receptionist who never takes a coffee break"

## Overview

Marge is an intelligent appointment booking system powered by AI that provides a natural conversational interface for clients to book, cancel, and manage appointments. Built for healthcare and beauty/wellness businesses.

## ✨ Features

- **🗣️ Natural Language Booking** - Chat with Marge to book appointments using everyday language
- **📅 Smart Calendar Management** - Real-time availability checking and appointment scheduling
- **👥 Client Recognition** - Automatically recognizes returning clients and maintains history
- **🔄 Easy Cancellations** - Cancel or reschedule appointments through simple conversation
- **📊 Business Dashboard** - Calendar view and appointment management for business owners
- **⚡ Real-time Updates** - Instant synchronization across all interfaces

## 🏗️ Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, OpenAI GPT-4
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI Function Calling for intelligent booking logic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor
   - This will create all necessary tables and sample data

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see Marge in action!

## 📖 How to Use

### For Clients
1. Visit the website
2. Click the chat button in the bottom right
3. Start a conversation with Marge:
   - "I'd like to book an appointment"
   - "What's available next Tuesday?"
   - "I need to cancel my appointment"

### For Business Owners
1. Visit `/dashboard` to access the admin interface
2. View appointments in calendar format
3. Manage clients and appointment statuses
4. Track business metrics

## 🤖 Marge's Capabilities

Marge can handle:

- ✅ **Booking appointments** - Natural language scheduling
- ✅ **Checking availability** - Real-time slot availability
- ✅ **Cancelling appointments** - Easy cancellation flow
- ✅ **Client recognition** - Remembers returning clients
- ✅ **Business questions** - Hours, location, basic info

Marge will politely escalate to human staff for:
- Complex service questions
- Pricing inquiries
- Detailed medical/beauty consultations

## 🎯 Conversation Examples

**Booking:**
```
User: Hi, I need an appointment
Marge: Good morning! I'd be happy to help you schedule an appointment. What day works best for you?
User: How about next Tuesday?
Marge: I have several openings next Tuesday. Would you prefer morning or afternoon?
User: Morning please
Marge: Perfect! I have 9:00 AM, 10:00 AM, and 11:00 AM available. Which time works best?
```

**Cancellation:**
```
User: I need to cancel my appointment
Marge: I can help you with that. May I have your email address to find your appointment?
User: john@email.com
Marge: I found your appointment scheduled for Tuesday, March 15th at 10:00 AM. Would you like me to cancel this appointment?
```

## 🛠️ Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── dashboard/      # Admin interface
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── chat/          # Chat widget components
│   ├── calendar/      # Calendar components
│   ├── dashboard/     # Dashboard components
│   └── ui/            # shadcn/ui components
├── lib/               # Utilities and services
│   ├── chat-handler.ts    # OpenAI integration
│   ├── booking-logic.ts   # Booking business logic
│   └── supabase.ts       # Database client
└── types/             # TypeScript definitions
```

### API Endpoints

- `POST /api/chat` - Process chat messages with Marge
- `GET /api/appointments` - Fetch appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments` - Update appointment status
- `GET /api/clients` - Fetch clients
- `GET /api/availability` - Check time slot availability

## 🔮 Roadmap

### Phase 2.0 (Post-MVP)
- ✉️ Email confirmations via SendGrid
- 📱 SMS reminders via Twilio  
- 💰 Payment processing via Stripe
- 👥 Multiple staff members
- 🔄 Recurring appointments

### Phase 3.0 (Advanced)
- 🧠 MCP-based specialized agents
- 📈 Advanced analytics and insights
- 🌍 Multi-language support
- 🔮 Predictive scheduling AI

---

**Built with ❤️ for businesses that care about their clients**
