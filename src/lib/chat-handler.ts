import OpenAI from 'openai';
import { Business, ChatMessage } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MARGE_SYSTEM_PROMPT = `
You are Marge, a professional and warm AI receptionist for a {business_type} business called {business_name}.
Your personality: Professional but warm, helpful, and efficient. You have a friendly, caring demeanor that puts clients at ease.

Your capabilities:
1. Schedule appointments (1-hour slots)
2. Check availability
3. Cancel appointments
4. Answer basic questions about the business

Booking rules:
- Appointments can be booked up to 30 days in advance
- Minimum 4 hours notice required for new bookings
- Business hours: {business_hours}
- All appointments are 1 hour long
- Only one appointment per time slot

When scheduling:
1. Always ask for the client's preferred date first
2. Then check availability and offer specific time slots
3. Once time is confirmed, collect: name, email, phone (optional)
4. Confirm all details before booking

For cancellations:
- Ask for the client's email to find their appointment
- Confirm appointment details before cancelling
- Be understanding and offer to reschedule if appropriate

If asked about anything beyond these capabilities (services, pricing, detailed medical/beauty questions), politely say:
"I'd be happy to connect you with our staff for that. Please call us at {phone} or email {email}."

Always be helpful, warm, and maintain a professional tone. Use the client's name once you know it.
`;

export async function handleChatMessage(
  message: string,
  context: ChatMessage[],
  businessInfo: Business
) {
  const functions = [
    {
      name: "check_availability",
      description: "Check available appointment slots for a specific date",
      parameters: {
        type: "object",
        properties: {
          date: { 
            type: "string", 
            description: "Date in YYYY-MM-DD format" 
          },
          time_preference: { 
            type: "string", 
            enum: ["morning", "afternoon", "evening", "any"],
            description: "Preferred time of day"
          }
        },
        required: ["date"]
      }
    },
    {
      name: "book_appointment",
      description: "Book an appointment for a client",
      parameters: {
        type: "object",
        properties: {
          date: { 
            type: "string",
            description: "Date in YYYY-MM-DD format"
          },
          time: { 
            type: "string",
            description: "Time in HH:MM format"
          },
          client_name: { 
            type: "string",
            description: "Client's full name"
          },
          client_email: { 
            type: "string",
            description: "Client's email address"
          },
          client_phone: { 
            type: "string",
            description: "Client's phone number (optional)"
          }
        },
        required: ["date", "time", "client_name", "client_email"]
      }
    },
    {
      name: "cancel_appointment",
      description: "Cancel an existing appointment",
      parameters: {
        type: "object",
        properties: {
          client_email: { 
            type: "string",
            description: "Client's email address to find the appointment"
          },
          appointment_id: { 
            type: "string",
            description: "Specific appointment ID if known"
          }
        },
        required: ["client_email"]
      }
    },
    {
      name: "find_client_appointments",
      description: "Find existing appointments for a client",
      parameters: {
        type: "object",
        properties: {
          client_email: { 
            type: "string",
            description: "Client's email address"
          }
        },
        required: ["client_email"]
      }
    }
  ];

  const systemPrompt = MARGE_SYSTEM_PROMPT
    .replace("{business_type}", businessInfo.type === 'healthcare' ? 'healthcare' : 'beauty and wellness')
    .replace("{business_name}", businessInfo.name)
    .replace("{business_hours}", formatBusinessHours(businessInfo.business_hours))
    .replace("{phone}", businessInfo.phone || 'our main number')
    .replace("{email}", businessInfo.email);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt
    },
    ...context.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    })),
    { 
      role: "user", 
      content: message 
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      functions,
      function_call: "auto",
      temperature: 0.7,
      max_tokens: 500
    });

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to process chat message');
  }
}

function formatBusinessHours(hours: { [key: string]: string }): string {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  
  return dayKeys.map((key, index) => {
    const dayName = daysOfWeek[index];
    const time = hours[key];
    if (time === 'closed') {
      return `${dayName}: Closed`;
    }
    return `${dayName}: ${time}`;
  }).join(', ');
}