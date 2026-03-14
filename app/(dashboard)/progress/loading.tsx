import { HealthLoader } from '@/components/shared/HealthLoader';

export default function ProgressLoading() {
  return (
    <HealthLoader
      icon="📈"
      message="Loading your progress…"
      submessage="Analyzing trends and goal achievements"
    />
  );
}
