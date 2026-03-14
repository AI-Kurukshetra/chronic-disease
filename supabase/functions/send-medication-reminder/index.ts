import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface DuePrescription {
  id: string;
  patient_id: string;
  dosage: string;
  frequency: string;
  next_reminder_at: string | null;
  medications: { name: string } | Array<{ name: string }> | null;
  profiles: { phone: string | null } | Array<{ phone: string | null }> | null;
}

serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response('Missing Supabase configuration', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date().toISOString();

  const { data: duePrescriptions, error } = await supabase
    .from('prescriptions')
    .select(
      'id, patient_id, dosage, frequency, next_reminder_at, medications(name), profiles!patient_id(phone)',
    )
    .eq('is_active', true)
    .lte('next_reminder_at', now);

  if (error) {
    return new Response('Failed to fetch prescriptions', { status: 500 });
  }

  for (const rx of (duePrescriptions ?? []) as DuePrescription[]) {
    const medication = Array.isArray(rx.medications) ? (rx.medications[0] ?? null) : rx.medications;
    const profile = Array.isArray(rx.profiles) ? (rx.profiles[0] ?? null) : rx.profiles;
    const medicationName = medication?.name ?? 'Medication';

    await supabase.from('medication_logs').insert({
      prescription_id: rx.id,
      patient_id: rx.patient_id,
      status: 'pending',
      scheduled_at: now,
    });

    await supabase.from('notifications').insert({
      recipient_id: rx.patient_id,
      type: 'medication_reminder',
      channel: 'in_app',
      status: 'queued',
      payload: {
        title: `Time for ${medicationName}`,
        body: `${rx.dosage} - ${rx.frequency}`,
      },
      scheduled_at: now,
    });

    await supabase
      .from('prescriptions')
      .update({
        next_reminder_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', rx.id);

    if (profile?.phone) {
      await sendTwilioSMS(
        profile.phone,
        `HealthOS reminder: time to take ${medicationName} (${rx.dosage}). Log it in the app.`,
      );
    }
  }

  return new Response('OK', { status: 200 });
});

async function sendTwilioSMS(to: string, message: string): Promise<void> {
  void to;
  void message;
  // TODO: Integrate Twilio SMS delivery with credentials stored in environment variables.
  return Promise.resolve();
}
