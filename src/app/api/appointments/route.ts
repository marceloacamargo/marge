import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { BookingService } from '@/lib/booking-logic';

// GET /api/appointments - Get appointments for a business
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('appointments')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('business_id', businessId)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (date) {
      query = query.eq('date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ appointments });

  } catch (error) {
    console.error('Appointments API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const { businessId, date, time, clientName, clientEmail, clientPhone, notes } = await request.json();

    if (!businessId || !date || !time || !clientName || !clientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await BookingService.bookAppointment(businessId, {
      date,
      time,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Add notes if provided
    if (notes && result.appointment) {
      const { error: updateError } = await supabaseAdmin
        .from('appointments')
        .update({ notes })
        .eq('id', result.appointment.id);

      if (updateError) {
        console.warn('Failed to add notes to appointment:', updateError);
      }
    }

    return NextResponse.json({ 
      appointment: result.appointment,
      message: 'Appointment created successfully'
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/appointments - Update appointment
export async function PUT(request: NextRequest) {
  try {
    const { id, status, notes, cancellationReason } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (cancellationReason) updateData.cancellation_reason = cancellationReason;
    
    if (status === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
    }

    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      appointment,
      message: 'Appointment updated successfully'
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}