import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FoodLogForm } from '@/components/nutrition/FoodLogForm';

const createFoodLogMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/actions/nutrition.actions', () => ({
  createFoodLog: createFoodLogMock,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

describe('FoodLogForm', () => {
  it('submits meal data', async () => {
    createFoodLogMock.mockResolvedValue({ success: true });

    render(<FoodLogForm />);

    await userEvent.selectOptions(screen.getByLabelText(/meal type/i), 'lunch');
    await userEvent.type(screen.getByLabelText(/description/i), 'Chicken salad');
    await userEvent.type(screen.getByLabelText(/calories/i), '420');

    await userEvent.click(screen.getByRole('button', { name: /save meal/i }));

    expect(createFoodLogMock).toHaveBeenCalledOnce();
    expect(refreshMock).toHaveBeenCalled();
  });
});
