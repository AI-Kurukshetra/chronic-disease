export interface PatientContext {
  vitals: Array<{ type: string; value: number; unit: string; recorded_at: string }>;
  prescriptions: Array<{
    medications: { name: string; drug_class: string | null } | null;
    dosage: string;
    frequency: string;
  }>;
  goals: Array<{
    title: string;
    metric: string | null;
    target_value: number | null;
    target_unit: string | null;
    status: string;
  }>;
}

export function buildCoachSystemPrompt(context: PatientContext): string {
  const vitalsSummary = summariseVitals(context.vitals);
  const medicationsList = context.prescriptions
    .map((prescription) => {
      const medicationName = prescription.medications?.name ?? 'Unknown medication';
      return `${medicationName} ${prescription.dosage} ${prescription.frequency}`;
    })
    .join(', ');

  const goalsList = context.goals
    .map((goal) => {
      const metric = goal.metric ?? 'metric';
      const targetValue = goal.target_value ?? 'n/a';
      const targetUnit = goal.target_unit ?? '';
      return `${goal.title} (target: ${targetValue} ${metric}${targetUnit ? ` ${targetUnit}` : ''})`;
    })
    .join('; ');

  return `You are a compassionate, evidence-based health coach for a patient managing a chronic condition with a Type 2 Diabetes focus. You use Cognitive Behavioral Therapy and Motivational Interviewing techniques.

PATIENT CONTEXT (last 7 days):
- Vital trends: ${vitalsSummary}
- Current medications: ${medicationsList || 'None recorded'}
- Active health goals: ${goalsList || 'No goals set yet'}

YOUR ROLE:
- Provide personalized, encouraging health coaching
- Help the patient understand their health data in plain language
- Suggest evidence-based lifestyle modifications
- Celebrate progress and reframe setbacks constructively
- Ask follow-up questions to understand the patient's situation

STRICT LIMITS:
- Never diagnose conditions
- Never prescribe or recommend specific medications or dosages
- Never contradict a doctor's written instructions
- If asked for specific medical advice, always redirect: "Your care team is best placed to advise on that - I can help you prepare questions for your next appointment."
- If you detect any crisis signals, immediately refer to emergency services

TONE: Warm, non-judgmental, and encouraging. Keep responses concise (2 to 4 paragraphs max).`;
}

function summariseVitals(vitals: PatientContext['vitals']): string {
  if (vitals.length === 0) {
    return 'No vitals logged this week';
  }

  const byType = vitals.reduce<Record<string, number[]>>((acc, vital) => {
    const values = acc[vital.type] ?? [];
    values.push(vital.value);
    acc[vital.type] = values;
    return acc;
  }, {});

  return Object.entries(byType)
    .map(([type, values]) => {
      const total = values.reduce((sum, current) => sum + current, 0);
      const avg = (total / values.length).toFixed(1);
      return `${type.replace(/_/g, ' ')}: avg ${avg}`;
    })
    .join(', ');
}
