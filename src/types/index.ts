export interface Business {
  id: string;
  name: string;
  type: 'healthcare' | 'beauty_wellness';
  email: string;
  phone?: string;
  address?: string;
  business_hours: BusinessHours;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  [key: string]: string;
}

export interface Client {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  preferences: Record<string, unknown>;
  first_visit?: string;
  last_visit?: string;
  total_appointments: number;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  client_id?: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  created_at: string;
  updated_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  client?: Client;
}

export interface ChatSession {
  id: string;
  business_id: string;
  client_id?: string;
  session_data: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
  timestamp?: string;
}

export interface BookingRequest {
  date: string;
  time: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
}

export interface AvailabilityRequest {
  date: string;
  time_preference?: 'morning' | 'afternoon' | 'evening' | 'any';
}