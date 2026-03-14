import { HealthLoader } from '@/components/shared/HealthLoader';

export default function Loading() {
  return (
    <HealthLoader
      icon="??"
      message="Loading settings…"
      submessage="Preparing provider preferences"
    />
  );
}
