# Marge Debugging Guide

This guide helps diagnose and fix common issues with the Marge AI appointment booking system.

## Quick Diagnosis

### 1. Check System Status

Run the setup verification script to check all components:

```bash
npm run verify:setup
```

This will check:
- ✅ Environment variables are set
- ✅ Database connection works 
- ✅ Demo business record exists
- ✅ Database tables are accessible

### 2. Test API Endpoint

Test the chat API directly:

```bash
npm run test:api
```

This will send test messages to the chat API and show detailed responses.

## Common Issues & Solutions

### Issue: "I'm sorry, I'm having trouble right now"

**Symptoms:** Chat widget shows generic error message

**Diagnosis Steps:**
1. Open browser DevTools → Console tab
2. Try sending a chat message
3. Look for error logs starting with "Chat error:" or "Response status:"

**Common Causes:**

#### Missing Environment Variables
- **Error:** `Database not configured` (503 status)
- **Solution:** Set Supabase environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
  - `SUPABASE_SERVICE_KEY`

#### Missing Demo Business
- **Error:** `Business not found` (404 status)
- **Solution:** Run `npm run verify:setup` to create the demo business

#### OpenAI API Issues  
- **Error:** `AI service temporarily unavailable` (503 status)
- **Solution:** Check `OPENAI_API_KEY` is set in Vercel and valid

#### Database Schema Issues
- **Error:** Various database errors
- **Solution:** Run the schema SQL in your Supabase SQL editor:
  ```sql
  -- Copy content from database/schema.sql
  ```

## Environment Variables Checklist

### Required for Production (Vercel):
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL` (optional)

### How to Set in Vercel:
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable for "Production" environment
4. Redeploy the application

## Manual Testing

### Test Chat API with curl:

```bash
curl -X POST https://marge-5q2yqyjtx-marcelos-projects-c5873dc1.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, I need help",
    "context": [],
    "businessId": "00000000-0000-0000-0000-000000000001"
  }'
```

### Expected Response:
```json
{
  "message": "Hello! I'm Marge, your appointment assistant. How may I help you today?"
}
```

## Debug Logging

The system now includes comprehensive logging. In production, you can view logs in:
- **Vercel:** Functions → View logs
- **Browser:** DevTools → Console tab

### Log Patterns to Look For:

**Successful Flow:**
```
=== Chat API Request Started ===
Request body: {"message":"hello","context":[],"businessId":"..."}
Environment check: {"hasOpenAI":true,"hasSupabaseUrl":true,...}
Fetching business information for ID: ...
Business found: {"id":"...","name":"Sunshine Dental Clinic"}
Processing message with OpenAI...
OpenAI response received: {"hasResponse":true,...}
Final response message: Hello! I'm Marge...
=== Chat API Request Completed Successfully ===
```

**Common Error Patterns:**
```
supabaseAdmin is null - database not configured
Business query error: {...}
OpenAI processing error: {...}
```

## Contact Support

If issues persist after following this guide:

1. **Check Vercel Function Logs** for detailed error messages
2. **Run diagnostic scripts** and share output
3. **Provide specific error messages** from browser console
4. **Include steps to reproduce** the issue

## Advanced Debugging

### Enable Verbose Logging

Set environment variable for more detailed logs:
```
DEBUG=marge:*
```

### Database Direct Access

Test Supabase connection directly:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your-supabase-url',
  'your-service-key'
)

const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', '00000000-0000-0000-0000-000000000001')
```