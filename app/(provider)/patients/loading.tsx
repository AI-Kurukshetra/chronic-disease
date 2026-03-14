import { HealthLoader } from '@/components/shared/HealthLoader';

export default function ProviderPatientsLoading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading patient panel…"
      submessage="Syncing care team insights"
    />
  );
}
