import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="🫀"
      message="Loading admin portal…"
      submessage="Preparing system insights"
    />
  );
}
