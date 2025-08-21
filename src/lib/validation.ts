import { z } from 'zod';

// Chat API validation
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional(),
  businessId: z.string().uuid(),
});

// Appointments API validation
export const CreateAppointmentSchema = z.object({
  businessId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email().max(255),
  clientPhone: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateAppointmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  notes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
});

export const GetAppointmentsSchema = z.object({
  businessId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
});

// Availability API validation
export const AvailabilityRequestSchema = z.object({
  businessId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timePreference: z.enum(['morning', 'afternoon', 'evening', 'any']).optional(),
});

// Clients API validation
export const CreateClientSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  notes: z.string().max(1000).optional(),
});

export const GetClientsSchema = z.object({
  businessId: z.string().uuid(),
  search: z.string().max(100).optional(),
});

// Utility function to validate and parse request data
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

// Utility function to parse query parameters
export function parseQueryParams(url: string) {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}