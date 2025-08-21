import { NextRequest, NextResponse } from 'next/server';
import { handleChatMessage } from '@/lib/chat-handler';
import { BookingService } from '@/lib/booking-logic';
import { supabaseAdmin } from '@/lib/supabase';
import { Business, ChatMessage } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { message, context, businessId } = await request.json();

    if (!message || !businessId) {
      return NextResponse.json(
        { error: 'Message and businessId are required' },
        { status: 400 }
      );
    }

    // Get business information
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Process message with OpenAI
    const response = await handleChatMessage(message, context || [], business as Business);
    
    const choice = response.choices[0];
    let responseMessage = choice.message?.content || "I'm sorry, I couldn't understand that. Could you please rephrase?";

    // Handle function calls
    if (choice.message?.function_call) {
      const functionName = choice.message.function_call.name;
      const functionArgs = JSON.parse(choice.message.function_call.arguments || '{}');

      let functionResult;

      switch (functionName) {
        case 'check_availability':
          const slots = await BookingService.getAvailableSlots(
            businessId,
            functionArgs.date,
            functionArgs.time_preference
          );
          
          if (slots.length === 0) {
            responseMessage = `I don't have any available slots on ${functionArgs.date}. Would you like to try a different date?`;
          } else {
            const timePreferenceText = functionArgs.time_preference && functionArgs.time_preference !== 'any' 
              ? ` in the ${functionArgs.time_preference}` 
              : '';
            
            responseMessage = `Great! I have these available times on ${functionArgs.date}${timePreferenceText}: ${slots.join(', ')}. Which time works best for you?`;
          }
          break;

        case 'book_appointment':
          functionResult = await BookingService.bookAppointment(businessId, {
            date: functionArgs.date,
            time: functionArgs.time,
            client_name: functionArgs.client_name,
            client_email: functionArgs.client_email,
            client_phone: functionArgs.client_phone
          });

          if (functionResult.success) {
            responseMessage = `Perfect! I've scheduled your appointment for ${functionArgs.date} at ${functionArgs.time}. You'll receive a confirmation at ${functionArgs.client_email}. Is there anything else I can help you with?`;
          } else {
            responseMessage = `I'm sorry, ${functionResult.error}. Would you like to choose a different time?`;
          }
          break;

        case 'cancel_appointment':
          functionResult = await BookingService.cancelAppointment(
            businessId,
            functionArgs.client_email,
            functionArgs.appointment_id
          );

          if (functionResult.success && functionResult.appointment) {
            const appt = functionResult.appointment;
            responseMessage = `I've successfully cancelled your appointment scheduled for ${appt.date} at ${appt.time}. If you'd like to reschedule, I'm happy to help you find a new time.`;
          } else {
            responseMessage = `I'm sorry, ${functionResult.error}. Please double-check your email address or contact us directly for assistance.`;
          }
          break;

        case 'find_client_appointments':
          functionResult = await BookingService.findClientAppointments(
            businessId,
            functionArgs.client_email
          );

          if (functionResult.success && functionResult.appointments) {
            if (functionResult.appointments.length === 0) {
              responseMessage = `I don't see any upcoming appointments for ${functionArgs.client_email}. Would you like to schedule one?`;
            } else {
              const appointmentList = functionResult.appointments
                .map(appt => `${appt.date} at ${appt.time}`)
                .join(', ');
              responseMessage = `Here are your upcoming appointments: ${appointmentList}. Is there anything you'd like to change?`;
            }
          } else {
            responseMessage = `I'm sorry, ${functionResult.error}. Please double-check your email address.`;
          }
          break;

        default:
          responseMessage = "I'm sorry, I couldn't process that request. How else can I help you?";
      }
    }

    // Store chat session (optional - for analytics)
    try {
      const chatMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: responseMessage,
        timestamp: new Date().toISOString()
      };

      // You could store the chat session here if needed
      // await supabaseAdmin.from('chat_sessions').insert(...)
    } catch (error) {
      console.warn('Failed to store chat session:', error);
      // Don't fail the request if chat storage fails
    }

    return NextResponse.json({ message: responseMessage });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}