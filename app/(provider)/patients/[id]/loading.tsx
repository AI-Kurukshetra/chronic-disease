import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="?????"
      message="Loading patient profile…"
      submessage="Retrieving vitals, notes, and care plan"
    />
  );
}
