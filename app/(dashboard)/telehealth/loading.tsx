import { HealthLoader } from '@/components/shared/HealthLoader';

export default function TelehealthLoading() {
  return (
    <HealthLoader
      icon="🩺"
      message="Loading telehealth appointments…"
      submessage="Fetching your scheduled consultations"
    />
  );
}
