import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading care plans…"
      submessage="Reviewing goals, risks, and interventions"
    />
  );
}
