import { HealthLoader } from '@/components/shared/HealthLoader';

export default function DashboardLoading() {
  return (
    <HealthLoader
      icon="🏥"
      message="Loading your health dashboard…"
      submessage="Gathering your latest health summary"
    />
  );
}
