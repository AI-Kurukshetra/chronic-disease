import { HealthLoader } from '@/components/shared/HealthLoader';

export default function NutritionLoading() {
  return (
    <HealthLoader
      icon="🥗"
      message="Loading your nutrition log…"
      submessage="Calculating macros and recent meals"
    />
  );
}
