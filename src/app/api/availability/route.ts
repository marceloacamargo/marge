import { NextRequest, NextResponse } from 'next/server';
import { BookingService } from '@/lib/booking-logic';

// GET /api/availability - Check availability for a business
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const date = searchParams.get('date');
    const timePreference = searchParams.get('timePreference') as 'morning' | 'afternoon' | 'evening' | 'any' | null;

    if (!businessId || !date) {
      return NextResponse.json(
        { error: 'Business ID and date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const requestedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return NextResponse.json(
        { error: 'Cannot check availability for past dates' },
        { status: 400 }
      );
    }

    // Check if date is within 30 days
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    
    if (requestedDate > maxDate) {
      return NextResponse.json(
        { error: 'Cannot book more than 30 days in advance' },
        { status: 400 }
      );
    }

    const availableSlots = await BookingService.getAvailableSlots(
      businessId,
      date,
      timePreference || undefined
    );

    return NextResponse.json({ 
      date,
      availableSlots,
      timePreference: timePreference || 'any'
    });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}