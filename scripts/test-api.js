/**
 * Script to test the chat API endpoint directly
 * Run with: node scripts/test-api.js
 */

const DEMO_BUSINESS_ID = '00000000-0000-0000-0000-000000000001';

async function testChatAPI() {
  console.log('=== Testing Chat API ===\n');

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://marge-5q2yqyjtx-marcelos-projects-c5873dc1.vercel.app'
    : 'http://localhost:3000';

  console.log(`Testing against: ${baseUrl}/api/chat`);

  const testCases = [
    {
      name: 'Simple greeting',
      message: 'Hello, I need help',
      context: []
    },
    {
      name: 'Appointment booking request',
      message: 'I would like to book an appointment',
      context: []
    },
    {
      name: 'Check availability',
      message: 'What appointments are available next Tuesday?',
      context: []
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📝 Message: "${testCase.message}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testCase.message,
          context: testCase.context,
          businessId: DEMO_BUSINESS_ID
        })
      });

      console.log(`📊 Status: ${response.status} ${response.statusText}`);

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        
        if (response.ok) {
          console.log('✅ Success!');
          console.log(`💬 Response: "${data.message}"`);
        } else {
          console.log('❌ Error Response:');
          console.log(`   Error: ${data.error}`);
          if (data.details) {
            console.log(`   Details: ${data.details}`);
          }
        }
      } catch (parseError) {
        console.log('❌ Failed to parse JSON response:');
        console.log(`   Raw response: ${responseText.substring(0, 200)}...`);
      }

    } catch (error) {
      console.log('❌ Network Error:');
      console.log(`   ${error.message}`);
    }

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n=== API Test Complete ===');
}

testChatAPI().catch(console.error);