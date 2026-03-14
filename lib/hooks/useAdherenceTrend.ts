'use client';

import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { buildAdherenceTrend, type AdherencePoint } from '@/lib/utils/analytics';

export interface MedicationLogRow {
  status: 'taken' | 'missed' | 'skipped' | 'pending';
  scheduled_at: string;
}

export const adherenceQueryKeys = {
  trend: (patientId: string, days: number) => ['adherence', 'trend', patientId, days] as const,
};

export function useAdherenceTrend(patientId: string, days: number) {
  const supabase = createSupabaseBrowserClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  return useQuery({
    queryKey: adherenceQueryKeys.trend(patientId, days),
    queryFn: async (): Promise<AdherencePoint[]> => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select('status, scheduled_at')
        .eq('patient_id', patientId)
        .gte('scheduled_at', since)
        .order('scheduled_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return buildAdherenceTrend((data ?? []) as MedicationLogRow[]);
    },
    staleTime: 1000 * 60 * 2,
  });
}
