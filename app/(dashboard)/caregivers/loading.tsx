import { HealthLoader } from '@/components/shared/HealthLoader';

export default function CaregiversLoading() {
  return (
    <HealthLoader
      icon="👨‍👩‍👧"
      message="Loading your care circle…"
      submessage="Fetching your family and caregiver access"
    />
  );
}
