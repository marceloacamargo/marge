import { NextRequest, NextResponse } from 'next/server';
import { handleChatMessage } from '@/lib/chat-handler';
import { BookingService } from '@/lib/booking-logic';
import { supabaseAdmin } from '@/lib/supabase';
import { Business } from '@/types';
import { ChatRequestSchema, validateRequest } from '@/lib/validation';

export async function POST(request: NextRequest) {
  console.log('=== Chat API Request Started ===');
  
  try {
    const requestBody = await request.json();
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Validate request data
    const validatedData = validateRequest(ChatRequestSchema, requestBody);
    const { message, context, businessId } = validatedData;

    // Check environment variables
    console.log('Environment check:', {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
    });

    // Get business information
    if (!supabaseAdmin) {
      console.error('supabaseAdmin is null - database not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    console.log('Fetching business information for ID:', businessId);

    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    if (businessError) {
      console.error('Business query error:', businessError);
      return NextResponse.json(
        { error: 'Business not found', details: businessError.message },
        { status: 404 }
      );
    }

    if (!business) {
      console.error('No business found with ID:', businessId);
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    console.log('Business found:', { id: business.id, name: business.name, type: business.type });

    // Process message with OpenAI
    console.log('Processing message with OpenAI...');
    try {
      const response = await handleChatMessage(message, context || [], business as Business);
      console.log('OpenAI response received:', {
        hasResponse: !!response,
        hasChoices: !!response?.choices?.length,
        firstChoiceContent: response?.choices?.[0]?.message?.content?.substring(0, 100),
        hasToolCalls: !!response?.choices?.[0]?.message?.tool_calls?.length
      });
    
      const choice = response.choices[0];
      let responseMessage = choice.message?.content || "I'm sorry, I couldn't understand that. Could you please rephrase?";

      // Handle tool calls (new API format)
      if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
        const toolCall = choice.message.tool_calls[0];
        if (toolCall.type === 'function') {
          console.log('Tool call detected:', toolCall.function.name);
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments || '{}');
          console.log('Function arguments:', functionArgs);

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
    }

      // Chat session storage could be implemented here if needed
      // await supabaseAdmin.from('chat_sessions').insert(...)

      console.log('Final response message:', responseMessage);
      console.log('=== Chat API Request Completed Successfully ===');
      return NextResponse.json({ message: responseMessage });

    } catch (openaiError) {
      console.error('OpenAI processing error:', openaiError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable', details: openaiError instanceof Error ? openaiError.message : 'Unknown OpenAI error' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Chat API general error:', error);
    
    // Handle validation errors specifically
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}