import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/clients - Get clients for a business
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessId = searchParams.get('businessId');
    const search = searchParams.get('search');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from('clients')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: clients, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients });

  } catch (error) {
    console.error('Clients API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create new client
export async function POST(request: NextRequest) {
  try {
    const { businessId, name, email, phone, notes } = await request.json();

    if (!businessId || !name || !email) {
      return NextResponse.json(
        { error: 'Business ID, name, and email are required' },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .insert({
        business_id: businessId,
        name,
        email,
        phone,
        notes,
        first_visit: new Date().toISOString().split('T')[0],
        total_appointments: 0
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating client:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'A client with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      client,
      message: 'Client created successfully'
    });

  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}