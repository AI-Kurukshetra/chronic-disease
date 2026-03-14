import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading reports…"
      submessage="Generating population health insights"
    />
  );
}
