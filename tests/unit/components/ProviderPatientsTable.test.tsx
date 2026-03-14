import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProviderPatientsTable } from '@/components/shared/ProviderPatientsTable';

describe('ProviderPatientsTable', () => {
  it('renders patient rows', () => {
    render(
      <ProviderPatientsTable
        rows={[
          {
            patient_id: 'patient-1',
            patient_name: 'Asha Patel',
            risk_level: 'high',
            last_active: null,
            open_alerts: 2,
            adherence_rate: 85,
          },
        ]}
      />,
    );

    expect(screen.getByText('Asha Patel')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
  });
});
