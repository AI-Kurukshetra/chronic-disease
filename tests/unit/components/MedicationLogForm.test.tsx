import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MedicationLogForm } from '@/components/medications/MedicationLogForm';

const logMedicationMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/medications.actions', () => ({
  logMedication: logMedicationMock,
}));

describe('MedicationLogForm', () => {
  it('submits taken status', async () => {
    logMedicationMock.mockResolvedValue({ success: true });

    render(<MedicationLogForm prescriptionId="rx-1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Taken' }));

    expect(logMedicationMock).toHaveBeenCalledOnce();
  });
});
