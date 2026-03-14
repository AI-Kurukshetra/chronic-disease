import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="???"
      message="Loading schedules…"
      submessage="Fetching upcoming appointments"
    />
  );
}
