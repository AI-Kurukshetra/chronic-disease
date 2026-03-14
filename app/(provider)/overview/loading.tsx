import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading provider overview…"
      submessage="Preparing your care team dashboard"
    />
  );
}
