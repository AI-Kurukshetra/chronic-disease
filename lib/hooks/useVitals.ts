import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { VitalType } from '@/lib/validations/vitals.schema';

export interface VitalRow {
  id: string;
  type: string;
  value: number;
  unit: string;
  recorded_at: string;
  alert_triggered: boolean;
}

export const vitalQueryKeys = {
  all: ['vitals'] as const,
  list: (patientId: string) => ['vitals', 'list', patientId] as const,
  trend: (patientId: string, type: string, days: number) =>
    ['vitals', 'trend', patientId, type, days] as const,
};

export function useVitals(patientId: string) {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: vitalQueryKeys.list(patientId),
    queryFn: async (): Promise<VitalRow[]> => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('id, type, value, unit, recorded_at, alert_triggered')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useVitalTrend(patientId: string, type: VitalType, days = 30) {
  const supabase = createSupabaseBrowserClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: vitalQueryKeys.trend(patientId, type, days),
    queryFn: async (): Promise<VitalRow[]> => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('id, type, value, unit, recorded_at, alert_triggered')
        .eq('patient_id', patientId)
        .eq('type', type)
        .gte('recorded_at', since)
        .order('recorded_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
    staleTime: 1000 * 60 * 2,
  });
}
