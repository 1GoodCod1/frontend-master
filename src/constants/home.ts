import {
  Search,
  MessageCircle,
  ThumbsUp,
  Wrench,
  Smartphone,
  Hammer,
  Droplets,
  Zap,
  Sofa,
  SparklesIcon,
  Truck,
  Car,
  Camera,
  Brush,
  HeartPulse,
  TreePine,
  Home,
  DoorOpen,
  Snowflake,
  Plug,
  Tv,
  LayoutGrid,
  Trash2,
  Wifi,
  type LucideIcon,
} from 'lucide-react';

/** Элемент FAQ */
export type HomeFaqItem = { q: string; a: string; linkSuffix?: string };

/** FAQ на главной */
export const HOME_FAQS: HomeFaqItem[] = [
  { q: 'faq.q1.question', a: 'faq.q1.answer' },
  { q: 'faq.q2.question', a: 'faq.q2.answer' },
  { q: 'faq.q3.question', a: 'faq.q3.answer' },
  { q: 'faq.q4.question', a: 'faq.q4.answer' },
  { q: 'faq.q5.question', a: 'faq.q5.answer' },
  { q: 'faq.q6.question', a: 'faq.q6.answer' },
  { q: 'faq.q7.question', a: 'faq.q7.answer' },
  { q: 'faq.q12.question', a: 'faq.q12.answer', linkSuffix: 'faq.q12.linkSuffix' },
];

/** Шаги блока "Как это работает" */
export const HOW_IT_WORKS_STEPS = [
  {
    icon: Search,
    titleKey: 'home.howItWorks.step1Title',
    descKey: 'home.howItWorks.step1Desc',
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-400/10',
    ring: 'ring-orange-500/20 dark:ring-orange-400/20',
  },
  {
    icon: MessageCircle,
    titleKey: 'home.howItWorks.step2Title',
    descKey: 'home.howItWorks.step2Desc',
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-400/10',
    ring: 'ring-blue-500/20 dark:ring-blue-400/20',
  },
  {
    icon: ThumbsUp,
    titleKey: 'home.howItWorks.step3Title',
    descKey: 'home.howItWorks.step3Desc',
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    ring: 'ring-emerald-500/20 dark:ring-emerald-400/20',
  },
] as const;

/**
 * Маппинг slug → иконка Lucide + градиент (fallback, если в API нет iconKey).
 * Синхронизировано с seed категорий в api-master/prisma/seed.ts
 */
export const CATEGORY_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  santehnika: { icon: Droplets, gradient: 'from-cyan-500 to-teal-400' },
  elektrika: { icon: Zap, gradient: 'from-yellow-500 to-amber-400' },
  plitka: { icon: LayoutGrid, gradient: 'from-orange-500 to-amber-500' },
  'otdelochnye-raboty': { icon: Hammer, gradient: 'from-slate-600 to-zinc-500' },
  'krovlya-fasad': { icon: Home, gradient: 'from-amber-600 to-orange-400' },
  'okna-dveri': { icon: DoorOpen, gradient: 'from-blue-600 to-indigo-400' },
  'bytovaya-tehnika': { icon: Plug, gradient: 'from-orange-600 to-amber-400' },
  'remont-telefonov-pk': { icon: Smartphone, gradient: 'from-blue-500 to-sky-400' },
  'ustanovka-tehniki': { icon: Tv, gradient: 'from-indigo-600 to-blue-400' },
  'kondicionery-otoplenie': { icon: Snowflake, gradient: 'from-cyan-400 to-blue-300' },
  pereezdy: { icon: Truck, gradient: 'from-indigo-500 to-violet-400' },
  'master-na-chas': { icon: Wrench, gradient: 'from-amber-500 to-orange-400' },
  'vyvoz-musora': { icon: Trash2, gradient: 'from-slate-500 to-gray-400' },
  uborka: { icon: SparklesIcon, gradient: 'from-sky-500 to-blue-400' },
  mebel: { icon: Sofa, gradient: 'from-emerald-500 to-green-400' },
  landshaft: { icon: TreePine, gradient: 'from-lime-500 to-green-400' },
  internet: { icon: Wifi, gradient: 'from-violet-500 to-purple-400' },
  avto: { icon: Car, gradient: 'from-slate-600 to-gray-500' },
  'foto-video': { icon: Camera, gradient: 'from-rose-500 to-fuchsia-500' },
  manikyur: { icon: Brush, gradient: 'from-pink-500 to-rose-400' },
  massazh: { icon: HeartPulse, gradient: 'from-emerald-500 to-teal-400' },
};

/** Дефолтная мета для категории без маппинга */
export const CATEGORY_DEFAULT_META = { icon: LayoutGrid, gradient: 'from-primary to-primary/70' };

/** Сколько карточек «Популярные мастера» на главной */
export const POPULAR_MASTERS_HOME_LIMIT = 8;
