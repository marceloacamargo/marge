/**
 * Script to verify Marge setup and database configuration
 * Run with: node scripts/verify-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

async function verifySetup() {
  console.log('=== Marge Setup Verification ===\n');

  // Check environment variables
  console.log('1. Environment Variables:');
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_KEY': !!process.env.SUPABASE_SERVICE_KEY,
    'OPENAI_API_KEY': !!process.env.OPENAI_API_KEY,
  };

  Object.entries(envVars).forEach(([key, exists]) => {
    console.log(`   ${exists ? '✅' : '❌'} ${key}`);
  });

  if (!envVars['NEXT_PUBLIC_SUPABASE_URL'] || !envVars['SUPABASE_SERVICE_KEY']) {
    console.log('\n❌ Missing required Supabase environment variables. Cannot proceed with database checks.');
    return;
  }

  // Test Supabase connection
  console.log('\n2. Database Connection:');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Test connection with a simple query
    const { data, error } = await supabase
      .from('businesses')
      .select('count(*)', { count: 'exact' });

    if (error) {
      console.log(`   ❌ Database connection failed: ${error.message}`);
      return;
    }

    console.log('   ✅ Database connection successful');
    console.log(`   📊 Total businesses in database: ${data[0]?.count || 0}`);

    // Check for demo business
    console.log('\n3. Demo Business Verification:');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', DEMO_BUSINESS_ID)
      .single();

    if (businessError || !business) {
      console.log(`   ❌ Demo business not found (ID: ${DEMO_BUSINESS_ID})`);
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
        console.log('   ✅ Demo business created successfully');
        console.log(`   📋 Business: ${newBusiness.name} (${newBusiness.type})`);
      }
    } else {
      console.log('   ✅ Demo business found');
      console.log(`   📋 Business: ${business.name} (${business.type})`);
      console.log(`   📧 Email: ${business.email}`);
      console.log(`   📞 Phone: ${business.phone}`);
    }

    // Check table structure
    console.log('\n4. Database Schema Check:');
    const tables = ['businesses', 'clients', 'appointments', 'chat_sessions'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`   ❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`   ✅ Table '${table}' exists and accessible`);
        }
      } catch (err) {
        console.log(`   ❌ Table '${table}': ${err.message}`);
      }
    }

  } catch (error) {
    console.log(`   ❌ Unexpected error: ${error.message}`);
  }

  // OpenAI Check
  console.log('\n5. OpenAI API Check:');
  if (!envVars['OPENAI_API_KEY']) {
    console.log('   ❌ OPENAI_API_KEY not set');
  } else {
    console.log('   ✅ OPENAI_API_KEY is set');
    console.log('   💡 To test OpenAI connectivity, try sending a chat message through the app');
  }

  console.log('\n=== Verification Complete ===');
}

verifySetup().catch(console.error);