import { HealthLoader } from '@/components/shared/HealthLoader';

export default function CommunityLoading() {
  return (
    <HealthLoader
      icon="🤝"
      message="Loading the community…"
      submessage="Connecting you with others on a similar journey"
    />
  );
}
