import { HealthLoader } from '@/components/shared/HealthLoader';

export default function EducationLoading() {
  return (
    <HealthLoader
      icon="📚"
      message="Loading health education library…"
      submessage="Curating articles relevant to your condition"
    />
  );
}
