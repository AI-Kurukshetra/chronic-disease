import { HealthLoader } from '@/components/shared/HealthLoader';

export default function SymptomsLoading() {
  return (
    <HealthLoader
      icon="🌡️"
      message="Loading your symptom history…"
      submessage="Reviewing severity trends over time"
    />
  );
}
