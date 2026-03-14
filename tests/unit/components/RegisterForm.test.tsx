import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterForm } from '@/components/forms/RegisterForm';

const registerPatientMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/auth.actions', () => ({
  registerPatient: registerPatientMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('RegisterForm', () => {
  it('submits registration data', async () => {
    registerPatientMock.mockResolvedValue({ success: true, redirectTo: '/onboarding' });

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText(/first name/i), 'Asha');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Patel');
    await userEvent.type(screen.getByLabelText(/email/i), 'asha@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'StrongPass123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'StrongPass123');

    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(registerPatientMock).toHaveBeenCalledOnce();
    expect(pushMock).toHaveBeenCalledWith('/onboarding');
  });
});
