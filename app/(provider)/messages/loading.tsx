import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading messages…"
      submessage="Syncing secure patient conversations"
    />
  );
}
