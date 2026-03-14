import { HealthLoader } from '@/components/shared/HealthLoader';

export default function CoachLoading() {
  return (
    <HealthLoader
      icon="🧠"
      message="Starting your AI Health Coach…"
      submessage="Loading conversation history and health context"
    />
  );
}
