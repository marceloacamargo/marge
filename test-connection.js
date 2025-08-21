import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('=== Testing Local Setup with Remote Supabase ===\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  console.log(`   ✅ SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}`);
  console.log(`   ✅ SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}`);
  console.log(`   ✅ SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Missing'}`);
  console.log(`   ✅ OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'Set' : 'Missing'}\n`);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.log('❌ Missing required environment variables');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  console.log('2. Database Connection Test:');
  
  try {
    // Test basic connection
    const { data: businesses, error: listError, count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    if (listError) {
      console.log(`   ❌ Connection failed: ${listError.message}`);
      return;
    }

    console.log(`   ✅ Connected successfully`);
    console.log(`   📊 Total businesses: ${count || 0}\n`);

    // Test demo business
    console.log('3. Demo Business Check:');
    const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';
    
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', DEMO_BUSINESS_ID)
      .single();

    if (businessError || !business) {
      console.log(`   ❌ Demo business not found`);
      console.log('   💡 Creating demo business...');
      
      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert({
          id: DEMO_BUSINESS_ID,
          name: 'Sunshine Dental Clinic',
          type: 'healthcare',
          email: 'info@sunshinedental.com',
          phone: '(555) 123-4567',
          address: '123 Main St, City, State 12345',
          business_hours: {
            "mon": "9:00-17:00",
            "tue": "9:00-17:00", 
            "wed": "9:00-17:00",
            "thu": "9:00-17:00",
            "fri": "9:00-17:00",
            "sat": "10:00-14:00",
            "sun": "closed"
          }
        })
        .select()
        .single();

      if (createError) {
        console.log(`   ❌ Failed to create demo business: ${createError.message}`);
      } else {
        console.log('   ✅ Demo business created successfully!');
      }
    } else {
      console.log(`   ✅ Demo business found: ${business.name}`);
    }

    console.log('\n4. Ready to Test!');
    console.log('   🌐 Visit: http://localhost:3000');
    console.log('   💬 Click the chat button and try: "Hello, I need help"');
    console.log('   🔍 Check browser console for detailed logs');

  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`);
  }
}

testConnection().catch(console.error);