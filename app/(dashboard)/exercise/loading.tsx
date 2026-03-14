import { HealthLoader } from '@/components/shared/HealthLoader';

export default function ExerciseLoading() {
  return (
    <HealthLoader
      icon="🏃"
      message="Loading your activity log…"
      submessage="Calculating weekly active minutes and calories"
    />
  );
}
