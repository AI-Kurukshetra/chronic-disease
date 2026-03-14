import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentForm } from '@/components/telehealth/AppointmentForm';

const createAppointmentMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/telehealth.actions', () => ({
  createAppointment: createAppointmentMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe('AppointmentForm', () => {
  it('submits appointment data', async () => {
    createAppointmentMock.mockResolvedValue({ success: true });

    render(<AppointmentForm />);

    await userEvent.selectOptions(screen.getByLabelText(/appointment type/i), 'telehealth');
    await userEvent.type(screen.getByLabelText(/scheduled at/i), '2025-01-01T10:00');
    await userEvent.clear(screen.getByLabelText(/duration/i));
    await userEvent.type(screen.getByLabelText(/duration/i), '30');

    await userEvent.click(screen.getByRole('button', { name: /schedule appointment/i }));

    expect(createAppointmentMock).toHaveBeenCalledOnce();
    expect(refreshMock).toHaveBeenCalled();
  });
});
