'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface EmergencyAlert {
  id: string;
  patient_id: string;
  severity: string;
  status: string;
  message: string;
  created_at: string;
}

export function useRealtimeAlerts(providerId: string, initialAlerts: EmergencyAlert[] = []) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const channel = supabase
      .channel(`provider-alerts-${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emergency_alerts',
          filter: 'status=eq.open',
        },
        (payload) => {
          setAlerts((prev) => [payload.new as EmergencyAlert, ...prev]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [providerId, supabase]);

  return alerts;
}
