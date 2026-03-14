import { HealthLoader } from '@/components/shared/HealthLoader';

export default function AssessmentsLoading() {
  return (
    <HealthLoader
      icon="📋"
      message="Loading health assessments…"
      submessage="Preparing your PHQ-9 and GAD-7 tools"
    />
  );
}
