import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingForm } from '@/components/forms/OnboardingForm';

const completeOnboardingMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/auth.actions', () => ({
  completeOnboarding: completeOnboardingMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe('OnboardingForm', () => {
  it('submits onboarding details', async () => {
    completeOnboardingMock.mockResolvedValue({ success: true, redirectTo: '/dashboard' });

    render(<OnboardingForm />);

    await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-12-31');
    await userEvent.type(screen.getByLabelText(/phone number/i), '5551234567');
    await userEvent.type(screen.getByLabelText(/timezone/i), 'America/New_York');
    await userEvent.clear(screen.getByLabelText(/primary condition/i));
    await userEvent.type(screen.getByLabelText(/primary condition/i), 'type2_diabetes');

    await userEvent.click(screen.getByRole('button', { name: /finish onboarding/i }));

    expect(completeOnboardingMock).toHaveBeenCalledOnce();
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });
});
