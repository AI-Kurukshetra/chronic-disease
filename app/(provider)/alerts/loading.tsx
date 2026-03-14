import { HealthLoader } from '@/components/shared/HealthLoader';

export default function ProviderAlertsLoading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading alerts…"
      submessage="Monitoring real-time patient signals"
    />
  );
}
