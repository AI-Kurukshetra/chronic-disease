import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProviderAlertsPanel } from '@/components/shared/ProviderAlertsPanel';

vi.mock('@/lib/hooks/useRealtimeAlerts', () => ({
  useRealtimeAlerts: () => [
    {
      id: 'alert-1',
      patient_id: 'patient-1',
      severity: 'critical',
      status: 'open',
      message: 'Crisis keywords detected in AI coach conversation.',
      created_at: new Date().toISOString(),
    },
  ],
}));

describe('ProviderAlertsPanel', () => {
  it('renders alerts from hook', () => {
    render(<ProviderAlertsPanel providerId="provider-1" initialAlerts={[]} />);

    expect(
      screen.getByText('Crisis keywords detected in AI coach conversation.'),
    ).toBeInTheDocument();
  });
});
