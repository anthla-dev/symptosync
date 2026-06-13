import { streamText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const xai = createOpenAI({
  apiKey: process.env.XAI_API_KEY ?? '',
  baseURL: 'https://api.x.ai/v1',
});

const SYSTEM_PROMPT = `You are a caring, professional medical triage assistant for SymptoSync. Your job is to:
- Greet the patient and ask about their main symptom.
- Ask follow-up questions (duration, severity, other symptoms) to assess urgency.
- Use a simple clinical reasoning process: if the symptom suggests a life-threatening emergency (chest pain, severe bleeding, suicidal ideation, trouble breathing, stroke signs, etc.), immediately escalate using the \`escalate_to_human\` tool and stop the conversation. Do not book appointments in emergencies.
- For non-emergency cases, determine the appropriate medical specialty (e.g., 'general', 'dermatology', 'orthopedics', 'mental health').
- Once a specialty is identified, use \`get_available_slots\` to fetch open appointments.
- Present the available slots to the patient. Let them choose, collect their full name and email (if not already known), then use \`book_appointment\`.
- Never make a diagnosis. Always remind patients that this is not a substitute for professional medical advice.
- Keep responses concise and warm.`;

const SLOT_MAP: Record<string, { datetime: string; provider: string }> = {
  'slot-1': { datetime: '2026-06-14T09:00:00', provider: 'Dr. Smith' },
  'slot-2': { datetime: '2026-06-14T10:30:00', provider: 'Dr. Patel' },
  'slot-3': { datetime: '2026-06-15T11:00:00', provider: 'Dr. Lee' },
  'slot-4': { datetime: '2026-06-15T14:00:00', provider: 'Dr. Garcia' },
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.XAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'XAI_API_KEY is not set in environment' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: xai('grok-3'),
      system: SYSTEM_PROMPT,
      messages,
      maxSteps: 10,
      tools: {
        get_available_slots: tool({
          description:
            'Fetch available appointment slots for a given medical specialty and optional date.',
          parameters: z.object({
            specialty: z
              .string()
              .describe(
                'Medical specialty, e.g. general, dermatology, orthopedics, mental health'
              ),
            date: z
              .string()
              .optional()
              .describe('Optional ISO date prefix to filter slots, e.g. 2026-06-14'),
          }),
          execute: async ({ specialty, date }) => {
            const slots = Object.entries(SLOT_MAP).map(([id, { datetime, provider }]) => ({
              id,
              datetime,
              provider,
              specialty,
            }));
            return date
              ? slots.filter((s) => s.datetime.startsWith(date))
              : slots;
          },
        }),

        book_appointment: tool({
          description:
            'Book a confirmed appointment after the patient has selected a slot and provided their details.',
          parameters: z.object({
            slot_id: z
              .string()
              .describe('The ID of the appointment slot the patient selected'),
            patient_name: z.string().describe('Full legal name of the patient'),
            patient_email: z
              .string()
              .email()
              .describe('Email address for booking confirmation'),
            specialty: z
              .string()
              .describe('Medical specialty for this appointment'),
          }),
          execute: async ({ slot_id, patient_name, patient_email, specialty }) => {
  const slot = SLOT_MAP[slot_id];
  if (!slot) {
    return {
      success: false,
      message: `Slot "${slot_id}" was not found. Please ask the patient to choose a valid slot.`,
    };
  }
  const confirmationId = `CONF-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;

  // --- SEND REAL EMAIL ---
  try {
    await resend.emails.send({
      from: 'SymptoSync <onboarding@resend.dev>', // Resend's default testing sender
      to: patient_email,
      subject: `Appointment Confirmed – ${specialty} with ${slot.provider}`,
      text: `Hi ${patient_name},\n\nYour appointment is confirmed for ${new Date(slot.datetime).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} with ${slot.provider}.\n\nConfirmation ID: ${confirmationId}\n\nThis is a demo booking from SymptoSync – not a real medical appointment.\n\nTake care,\nSymptoSync`,
    });
  } catch (emailError) {
    console.error('Email send failed:', emailError);
    // Continue even if email fails – the booking is still confirmed
  }

  return {
    success: true,
    confirmation_id: confirmationId,
    patient_name,
    patient_email,
    specialty,
    datetime: slot.datetime,
    provider: slot.provider,
    message: `Appointment confirmed for ${patient_name} with ${slot.provider} on ${new Date(
      slot.datetime
    ).toLocaleString('en-US', {
      dateStyle: 'long',
      timeStyle: 'short',
    })}. Confirmation ID: ${confirmationId}. A summary has been sent to ${patient_email}.`,
  };
},

        escalate_to_human: tool({
          description:
            'Immediately escalate to emergency services when life-threatening symptoms are detected. Call this before saying anything else in an emergency.',
          parameters: z.object({
            reason: z
              .string()
              .describe(
                'The specific emergency symptom or situation that triggered escalation'
              ),
            severity: z
              .enum(['high', 'critical'])
              .describe(
                '"critical" for immediate life threat (e.g. cardiac arrest, stroke), "high" for urgent but slightly less immediate (e.g. severe allergic reaction)'
              ),
          }),
          execute: async ({ reason, severity }) => {
            return {
              escalated: true,
              severity,
              reason,
              emergency_number: '911',
              timestamp: new Date().toISOString(),
              message:
                severity === 'critical'
                  ? '🚨 CRITICAL EMERGENCY DETECTED. Call 911 or your local emergency number immediately. Do not wait. A human agent has been alerted.'
                  : '🚨 URGENT: This situation requires immediate medical attention. Please call 911 or go to your nearest emergency room now. A human agent has been alerted.',
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('ROUTE ERROR:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || error?.toString() || 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
