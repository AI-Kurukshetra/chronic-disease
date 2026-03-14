import type { Article } from '@/components/education/ArticleCard';

export const EDUCATION_ARTICLES: Article[] = [
  // Diabetes Management
  {
    id: 'diabetes-blood-sugar-basics',
    title: 'Understanding Blood Sugar Levels',
    summary:
      'Learn what blood glucose numbers mean, when to test, and how to interpret your readings to better manage your diabetes.',
    category: 'Diabetes',
    readTime: 5,
    tags: ['blood glucose', 'monitoring', 'diabetes'],
    icon: '🩸',
  },
  {
    id: 'diabetes-carb-counting',
    title: 'Carbohydrate Counting for Diabetes',
    summary:
      'Carb counting is a meal planning technique that helps people with diabetes manage blood sugar. Discover how to estimate carbs and plan balanced meals.',
    category: 'Diabetes',
    readTime: 7,
    tags: ['nutrition', 'carbs', 'meal planning'],
    icon: '🥗',
  },
  {
    id: 'diabetes-exercise-benefits',
    title: 'Exercise and Blood Sugar Control',
    summary:
      'Physical activity improves insulin sensitivity and helps lower blood glucose. Learn how different exercises affect your levels and how to stay safe.',
    category: 'Diabetes',
    readTime: 6,
    tags: ['exercise', 'insulin', 'activity'],
    icon: '🏃',
  },
  // Heart Health
  {
    id: 'heart-blood-pressure-guide',
    title: 'Managing High Blood Pressure',
    summary:
      'Hypertension is a silent condition that raises the risk of heart attack and stroke. Understand your numbers and effective lifestyle strategies to lower BP.',
    category: 'Heart Health',
    readTime: 6,
    tags: ['blood pressure', 'hypertension', 'heart'],
    icon: '❤️',
  },
  {
    id: 'heart-sodium-reduction',
    title: 'Reducing Sodium for Heart Health',
    summary:
      'Most Americans consume twice the recommended daily sodium. Learn how to spot hidden salt in foods and make heart-healthy swaps.',
    category: 'Heart Health',
    readTime: 4,
    tags: ['sodium', 'diet', 'heart'],
    icon: '🧂',
  },
  {
    id: 'heart-cholesterol-explained',
    title: 'Cholesterol: What Your Numbers Mean',
    summary:
      'Not all cholesterol is bad. This guide explains LDL, HDL, triglycerides, and what target levels mean for your cardiovascular risk.',
    category: 'Heart Health',
    readTime: 5,
    tags: ['cholesterol', 'LDL', 'HDL'],
    icon: '💊',
  },
  // Weight & Metabolism
  {
    id: 'weight-bmi-explained',
    title: 'Understanding BMI and Body Composition',
    summary:
      'BMI is one measure of weight health, but it does not tell the whole story. Learn what BMI measures, its limitations, and better indicators of metabolic health.',
    category: 'Weight & Metabolism',
    readTime: 4,
    tags: ['BMI', 'weight', 'metabolism'],
    icon: '⚖️',
  },
  {
    id: 'weight-intermittent-fasting',
    title: 'Intermittent Fasting: Evidence and Risks',
    summary:
      'Intermittent fasting has gained popularity for weight management. Review the current evidence, who it may help, and important considerations for people with chronic conditions.',
    category: 'Weight & Metabolism',
    readTime: 8,
    tags: ['fasting', 'weight loss', 'nutrition'],
    icon: '🕐',
  },
  // Mental Health
  {
    id: 'mental-health-chronic-disease',
    title: 'Chronic Disease and Mental Health',
    summary:
      'Living with a chronic condition significantly increases the risk of depression and anxiety. Understand the connection and proven strategies to protect your mental well-being.',
    category: 'Mental Health',
    readTime: 6,
    tags: ['depression', 'anxiety', 'coping'],
    icon: '🧠',
  },
  {
    id: 'mental-health-stress-management',
    title: 'Stress Management Techniques',
    summary:
      'Chronic stress worsens nearly every health condition. Explore evidence-based techniques including mindfulness, breathing exercises, and cognitive reframing.',
    category: 'Mental Health',
    readTime: 7,
    tags: ['stress', 'mindfulness', 'breathing'],
    icon: '🧘',
  },
  // Medications
  {
    id: 'medications-adherence',
    title: 'Why Medication Adherence Matters',
    summary:
      'Non-adherence to prescribed medications leads to 125,000 preventable deaths per year in the US. Learn practical strategies to stay consistent with your regimen.',
    category: 'Medications',
    readTime: 5,
    tags: ['adherence', 'prescriptions', 'reminders'],
    icon: '💉',
  },
  {
    id: 'medications-interactions',
    title: 'Common Drug-Food Interactions',
    summary:
      'Certain foods can change how your medications work. Discover key interactions to watch for, including grapefruit with statins and vitamin K with warfarin.',
    category: 'Medications',
    readTime: 6,
    tags: ['drug interactions', 'food', 'safety'],
    icon: '⚠️',
  },
  // Lifestyle
  {
    id: 'lifestyle-sleep-health',
    title: 'Sleep and Chronic Disease',
    summary:
      'Poor sleep disrupts blood sugar regulation, increases appetite, raises blood pressure, and weakens immunity. Improve your sleep hygiene with these evidence-based tips.',
    category: 'Lifestyle',
    readTime: 5,
    tags: ['sleep', 'circadian', 'recovery'],
    icon: '😴',
  },
  {
    id: 'lifestyle-hydration',
    title: 'Hydration and Kidney Health',
    summary:
      'Proper hydration is crucial for people with diabetes and kidney conditions. Learn how much to drink, signs of dehydration, and which beverages to limit.',
    category: 'Lifestyle',
    readTime: 4,
    tags: ['hydration', 'kidneys', 'water'],
    icon: '💧',
  },
  {
    id: 'lifestyle-smoking-cessation',
    title: 'Quitting Smoking with a Chronic Condition',
    summary:
      'Smoking dramatically worsens outcomes for nearly every chronic disease. Explore evidence-based cessation strategies and how your health begins to improve within hours of quitting.',
    category: 'Lifestyle',
    readTime: 6,
    tags: ['smoking', 'cessation', 'lung health'],
    icon: '🚭',
  },
];

export const EDUCATION_CATEGORIES = [...new Set(EDUCATION_ARTICLES.map((a) => a.category))];
