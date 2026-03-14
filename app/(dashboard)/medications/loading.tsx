import { HealthLoader } from '@/components/shared/HealthLoader';

export default function MedicationsLoading() {
  return (
    <HealthLoader
      icon="💊"
      message="Loading your medications…"
      submessage="Checking adherence and pending reminders"
    />
  );
}
