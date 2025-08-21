import { supabaseAdmin } from './supabase';
import { Appointment, Client, BookingRequest } from '@/types';

export class BookingService {
  
  // Check if a specific time slot is available
  static async isTimeSlotAvailable(
    businessId: string, 
    date: string, 
    time: string
  ): Promise<boolean> {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return false;
    }

    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('id')
      .eq('business_id', businessId)
      .eq('date', date)
      .eq('time', time)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Error checking availability:', error);
      return false;
    }

    return data.length === 0;
  }

  // Get available time slots for a specific date
  static async getAvailableSlots(
    businessId: string, 
    date: string,
    timePreference?: 'morning' | 'afternoon' | 'evening' | 'any'
  ): Promise<string[]> {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return [];
    }
    
    // Get business info to check business hours
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('business_hours')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('Error fetching business hours:', businessError);
      return [];
    }

    // Get day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const dayKey = dayOfWeek === 'sun' ? 'sun' : 
                   dayOfWeek === 'mon' ? 'mon' :
                   dayOfWeek === 'tue' ? 'tue' :
                   dayOfWeek === 'wed' ? 'wed' :
                   dayOfWeek === 'thu' ? 'thu' :
                   dayOfWeek === 'fri' ? 'fri' : 'sat';

    const businessHours = business.business_hours[dayKey];
    
    if (businessHours === 'closed') {
      return [];
    }

    // Parse business hours (e.g., "9:00-17:00")
    const [openTime, closeTime] = businessHours.split('-');
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    // Generate time slots (1-hour intervals)
    const slots: string[] = [];
    let currentHour = openHour;
    const currentMinute = openMinute;

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Filter by time preference
      if (this.matchesTimePreference(timeSlot, timePreference)) {
        // Check if slot is available
        const isAvailable = await this.isTimeSlotAvailable(businessId, date, timeSlot);
        if (isAvailable) {
          slots.push(timeSlot);
        }
      }

      // Move to next hour
      currentHour += 1;
    }

    return slots;
  }

  // Helper to match time preference
  private static matchesTimePreference(
    time: string, 
    preference?: 'morning' | 'afternoon' | 'evening' | 'any'
  ): boolean {
    if (!preference || preference === 'any') return true;

    const hour = parseInt(time.split(':')[0]);
    
    switch (preference) {
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 17;
      case 'evening':
        return hour >= 17 && hour < 21;
      default:
        return true;
    }
  }

  // Book an appointment
  static async bookAppointment(
    businessId: string,
    bookingRequest: BookingRequest
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    
    try {
      if (!supabaseAdmin) {
        return {
          success: false,
          error: 'Database not configured'
        };
      }
      
      // Check if time slot is still available
      const isAvailable = await this.isTimeSlotAvailable(
        businessId, 
        bookingRequest.date, 
        bookingRequest.time
      );

      if (!isAvailable) {
        return { 
          success: false, 
          error: 'This time slot is no longer available' 
        };
      }

      // Check if client exists, if not create them
      const client = await this.getOrCreateClient(businessId, {
        name: bookingRequest.client_name,
        email: bookingRequest.client_email,
        phone: bookingRequest.client_phone
      });

      if (!client) {
        return { 
          success: false, 
          error: 'Failed to create client record' 
        };
      }

      // Create appointment
      const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .insert({
          business_id: businessId,
          client_id: client.id,
          date: bookingRequest.date,
          time: bookingRequest.time,
          duration: 60,
          status: 'scheduled'
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        return { 
          success: false, 
          error: 'Failed to create appointment' 
        };
      }

      // Update client stats
      await this.updateClientStats(client.id);

      return { 
        success: true, 
        appointment: appointment as Appointment 
      };

    } catch (error) {
      console.error('Booking error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }

  // Get or create client
  static async getOrCreateClient(
    businessId: string,
    clientInfo: { name: string; email: string; phone?: string }
  ): Promise<Client | null> {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return null;
    }
    
    // Try to find existing client
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('business_id', businessId)
      .eq('email', clientInfo.email)
      .single();

    if (existingClient) {
      // Update phone if provided and different
      if (clientInfo.phone && clientInfo.phone !== existingClient.phone) {
        const { data: updatedClient } = await supabaseAdmin
          .from('clients')
          .update({ 
            phone: clientInfo.phone,
            name: clientInfo.name // Update name in case it changed
          })
          .eq('id', existingClient.id)
          .select('*')
          .single();
        
        return updatedClient as Client;
      }
      return existingClient as Client;
    }

    // Create new client
    const { data: newClient, error } = await supabaseAdmin
      .from('clients')
      .insert({
        business_id: businessId,
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
        first_visit: new Date().toISOString().split('T')[0],
        total_appointments: 0
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return null;
    }

    return newClient as Client;
  }

  // Update client statistics
  static async updateClientStats(clientId: string): Promise<void> {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not configured');
      return;
    }
    
    const { data: appointments } = await supabaseAdmin
      .from('appointments')
      .select('date')
      .eq('client_id', clientId)
      .neq('status', 'cancelled')
      .order('date', { ascending: false });

    if (appointments && appointments.length > 0) {
      await supabaseAdmin
        .from('clients')
        .update({
          total_appointments: appointments.length,
          last_visit: appointments[0].date
        })
        .eq('id', clientId);
    }
  }

  // Cancel appointment
  static async cancelAppointment(
    businessId: string,
    clientEmail: string,
    appointmentId?: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    
    try {
      if (!supabaseAdmin) {
        return {
          success: false,
          error: 'Database not configured'
        };
      }
      
      let query = supabaseAdmin
        .from('appointments')
        .select('*, clients(*)')
        .eq('business_id', businessId)
        .neq('status', 'cancelled');

      if (appointmentId) {
        query = query.eq('id', appointmentId);
      } else {
        // Find client first
        const { data: client } = await supabaseAdmin
          .from('clients')
          .select('id')
          .eq('business_id', businessId)
          .eq('email', clientEmail)
          .single();

        if (!client) {
          return { 
            success: false, 
            error: 'No client found with that email address' 
          };
        }

        query = query
          .eq('client_id', client.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true });
      }

      const { data: appointments, error: fetchError } = await query;

      if (fetchError || !appointments || appointments.length === 0) {
        return { 
          success: false, 
          error: 'No upcoming appointments found for this client' 
        };
      }

      // Take the first (soonest) appointment if multiple found
      const appointmentToCancel = appointments[0];

      // Cancel the appointment
      const { data: cancelledAppointment, error: cancelError } = await supabaseAdmin
        .from('appointments')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Cancelled by client via chat'
        })
        .eq('id', appointmentToCancel.id)
        .select('*')
        .single();

      if (cancelError) {
        return { 
          success: false, 
          error: 'Failed to cancel appointment' 
        };
      }

      // Update client stats
      if (appointmentToCancel.client_id) {
        await this.updateClientStats(appointmentToCancel.client_id);
      }

      return { 
        success: true, 
        appointment: cancelledAppointment as Appointment 
      };

    } catch (error) {
      console.error('Cancellation error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }

  // Find client appointments
  static async findClientAppointments(
    businessId: string,
    clientEmail: string
  ): Promise<{ success: boolean; appointments?: Appointment[]; error?: string }> {
    
    try {
      if (!supabaseAdmin) {
        return {
          success: false,
          error: 'Database not configured'
        };
      }
      
      // Find client first
      const { data: client } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('business_id', businessId)
        .eq('email', clientEmail)
        .single();

      if (!client) {
        return { 
          success: false, 
          error: 'No client found with that email address' 
        };
      }

      // Get upcoming appointments
      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('client_id', client.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .neq('status', 'cancelled')
        .order('date', { ascending: true });

      if (error) {
        return { 
          success: false, 
          error: 'Failed to fetch appointments' 
        };
      }

      return { 
        success: true, 
        appointments: appointments as Appointment[] 
      };

    } catch (error) {
      console.error('Error finding appointments:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred' 
      };
    }
  }
}