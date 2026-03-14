import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VitalSignForm } from '@/components/forms/VitalSignForm';

const logVitalSignMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/vitals.actions', () => ({
  logVitalSign: logVitalSignMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe('VitalSignForm', () => {
  it('submits vital sign data', async () => {
    logVitalSignMock.mockResolvedValue({ success: true });

    render(<VitalSignForm />);

    await userEvent.type(screen.getByLabelText(/value/i), '120');
    await userEvent.type(screen.getByLabelText(/notes/i), 'After breakfast');

    await userEvent.click(screen.getByRole('button', { name: /log vital/i }));

    expect(logVitalSignMock).toHaveBeenCalledOnce();
    expect(refreshMock).toHaveBeenCalledOnce();
  });
});
