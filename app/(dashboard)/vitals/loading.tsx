import { HealthLoader } from '@/components/shared/HealthLoader';

export default function VitalsLoading() {
  return (
    <HealthLoader
      icon="🩺"
      message="Loading your vital signs…"
      submessage="Fetching recent readings and trend data"
    />
  );
}
