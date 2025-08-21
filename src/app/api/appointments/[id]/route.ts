import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/appointments/[id] - Get specific appointment
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const { data: appointment, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment });

  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  try {
    const { error } = await supabaseAdmin
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting appointment:', error);
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Appointment deleted successfully' 
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}