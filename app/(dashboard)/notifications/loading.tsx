import { HealthLoader } from '@/components/shared/HealthLoader';

export default function NotificationsLoading() {
  return (
    <HealthLoader
      icon="🔔"
      message="Loading notifications…"
      submessage="Fetching your health alerts and reminders"
    />
  );
}
