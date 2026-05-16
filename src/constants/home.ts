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
  Building2,
  ShoppingBag,
  Trophy,
  Tractor,
  Waves,
  Compass,
  Code2,
  Megaphone,
  Palette,
  Clapperboard,
  Box,
  Sun,
  Dumbbell,
  Flower2,
  Brain,
  Stethoscope,
  HandHeart,
  Music,
  PartyPopper,
  Mic2,
  Syringe,
  Forklift,
  CarFront,
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
/** Muted color tone per category — visible but not flashy, theme-aware. */
export const CATEGORY_META: Record<string, { icon: LucideIcon; gradient: string; color: string }> = {
  santehnika: { icon: Droplets, gradient: 'from-cyan-500 to-teal-400', color: 'text-cyan-600 dark:text-cyan-400' },
  elektrika: { icon: Zap, gradient: 'from-yellow-500 to-amber-400', color: 'text-amber-600 dark:text-amber-400' },
  plitka: { icon: LayoutGrid, gradient: 'from-orange-500 to-amber-500', color: 'text-orange-600 dark:text-orange-400' },
  'otdelochnye-raboty': { icon: Hammer, gradient: 'from-slate-600 to-zinc-500', color: 'text-slate-600 dark:text-slate-400' },
  'krovlya-fasad': { icon: Home, gradient: 'from-amber-600 to-orange-400', color: 'text-amber-700 dark:text-amber-400' },
  'okna-dveri': { icon: DoorOpen, gradient: 'from-blue-600 to-indigo-400', color: 'text-blue-600 dark:text-blue-400' },
  'bytovaya-tehnika': { icon: Plug, gradient: 'from-orange-600 to-amber-400', color: 'text-orange-600 dark:text-orange-400' },
  'remont-telefonov-pk': { icon: Smartphone, gradient: 'from-blue-500 to-sky-400', color: 'text-sky-600 dark:text-sky-400' },
  'ustanovka-tehniki': { icon: Tv, gradient: 'from-indigo-600 to-blue-400', color: 'text-indigo-600 dark:text-indigo-400' },
  'kondicionery-otoplenie': { icon: Snowflake, gradient: 'from-cyan-400 to-blue-300', color: 'text-cyan-600 dark:text-cyan-400' },
  pereezdy: { icon: Truck, gradient: 'from-indigo-500 to-violet-400', color: 'text-indigo-600 dark:text-indigo-400' },
  'master-na-chas': { icon: Wrench, gradient: 'from-amber-500 to-orange-400', color: 'text-amber-600 dark:text-amber-400' },
  'vyvoz-musora': { icon: Trash2, gradient: 'from-slate-500 to-gray-400', color: 'text-slate-500 dark:text-slate-400' },
  uborka: { icon: SparklesIcon, gradient: 'from-sky-500 to-blue-400', color: 'text-sky-600 dark:text-sky-400' },
  mebel: { icon: Sofa, gradient: 'from-emerald-500 to-green-400', color: 'text-emerald-600 dark:text-emerald-400' },
  landshaft: { icon: TreePine, gradient: 'from-lime-500 to-green-400', color: 'text-green-600 dark:text-green-400' },
  internet: { icon: Wifi, gradient: 'from-violet-500 to-purple-400', color: 'text-violet-600 dark:text-violet-400' },
  avto: { icon: Car, gradient: 'from-slate-600 to-gray-500', color: 'text-slate-600 dark:text-slate-400' },
  'foto-video': { icon: Camera, gradient: 'from-rose-500 to-fuchsia-500', color: 'text-rose-600 dark:text-rose-400' },
  manikyur: { icon: Brush, gradient: 'from-pink-500 to-rose-400', color: 'text-pink-600 dark:text-pink-400' },
  massazh: { icon: HeartPulse, gradient: 'from-emerald-500 to-teal-400', color: 'text-emerald-600 dark:text-emerald-400' },
  // New categories
  'agro-servicii': { icon: Tractor, gradient: 'from-lime-600 to-green-500', color: 'text-green-700 dark:text-green-400' },
  'fantani-puturi': { icon: Waves, gradient: 'from-cyan-600 to-blue-500', color: 'text-cyan-700 dark:text-cyan-400' },
  'ghid-turism': { icon: Compass, gradient: 'from-amber-500 to-rose-500', color: 'text-amber-600 dark:text-amber-400' },
  'it-dezvoltare': { icon: Code2, gradient: 'from-blue-600 to-indigo-500', color: 'text-blue-600 dark:text-blue-400' },
  'smm-marketing': { icon: Megaphone, gradient: 'from-pink-500 to-fuchsia-500', color: 'text-pink-600 dark:text-pink-400' },
  'design-grafic': { icon: Palette, gradient: 'from-violet-500 to-pink-500', color: 'text-violet-600 dark:text-violet-400' },
  'videomontaj-animatie': { icon: Clapperboard, gradient: 'from-rose-500 to-purple-500', color: 'text-rose-600 dark:text-rose-400' },
  '3d-laser': { icon: Box, gradient: 'from-sky-500 to-indigo-500', color: 'text-sky-600 dark:text-sky-400' },
  'panouri-solare': { icon: Sun, gradient: 'from-yellow-500 to-orange-400', color: 'text-yellow-600 dark:text-yellow-400' },
  'antrenori-fitness': { icon: Dumbbell, gradient: 'from-orange-500 to-red-500', color: 'text-orange-600 dark:text-orange-400' },
  'yoga-pilates': { icon: Flower2, gradient: 'from-purple-400 to-pink-400', color: 'text-purple-600 dark:text-purple-400' },
  'psihologi-coaching': { icon: Brain, gradient: 'from-indigo-500 to-blue-500', color: 'text-indigo-600 dark:text-indigo-400' },
  fizioterapie: { icon: Stethoscope, gradient: 'from-emerald-500 to-teal-500', color: 'text-teal-600 dark:text-teal-400' },
  'ingrijire-varstnici': { icon: HandHeart, gradient: 'from-rose-400 to-pink-400', color: 'text-rose-500 dark:text-rose-400' },
  'dj-muzicieni': { icon: Music, gradient: 'from-fuchsia-500 to-violet-500', color: 'text-fuchsia-600 dark:text-fuchsia-400' },
  'animatori-copii': { icon: PartyPopper, gradient: 'from-yellow-400 to-pink-500', color: 'text-yellow-600 dark:text-yellow-400' },
  'sunet-evenimente': { icon: Mic2, gradient: 'from-cyan-500 to-blue-500', color: 'text-cyan-600 dark:text-cyan-400' },
  'tatuaje-piercing': { icon: Syringe, gradient: 'from-zinc-700 to-rose-500', color: 'text-zinc-700 dark:text-zinc-300' },
  tamplarie: { icon: Hammer, gradient: 'from-amber-600 to-yellow-600', color: 'text-amber-700 dark:text-amber-400' },
  'tractare-auto': { icon: Forklift, gradient: 'from-orange-700 to-red-600', color: 'text-orange-700 dark:text-orange-400' },
  'sofer-personal': { icon: CarFront, gradient: 'from-slate-700 to-zinc-600', color: 'text-slate-600 dark:text-slate-400' },
};

/** Дефолтная мета для категории без маппинга */
export const CATEGORY_DEFAULT_META = {
  icon: LayoutGrid,
  gradient: 'from-primary to-primary/70',
  color: 'text-foreground/70',
};

/** Пункты роадмапа на главной */
export const ROADMAP_ITEMS = [
  {
    icon: Building2,
    titleKey: 'home.roadmap.item1Title',
    descKey: 'home.roadmap.item1Desc',
    statusKey: 'home.roadmap.statusSoon',
    accent: 'text-primary dark:text-primary',
    bg: 'bg-primary/10 dark:bg-primary/10',
    ring: 'ring-primary/20',
    statusColor: 'bg-primary/10 text-primary dark:bg-primary/10 dark:text-primary',
  },
  {
    icon: ShoppingBag,
    titleKey: 'home.roadmap.item2Title',
    descKey: 'home.roadmap.item2Desc',
    statusKey: 'home.roadmap.statusDev',
    accent: 'text-orange-600 dark:text-[#E97525]',
    bg: 'bg-orange-500/10 dark:bg-[#E97525]/10',
    ring: 'ring-orange-500/20 dark:ring-[#E97525]/20',
    statusColor: 'bg-orange-500/10 text-orange-600 dark:bg-[#E97525]/10 dark:text-[#E97525]',
  },
  {
    icon: Trophy,
    titleKey: 'home.roadmap.item3Title',
    descKey: 'home.roadmap.item3Desc',
    statusKey: 'home.roadmap.statusPlanned',
    accent: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 dark:bg-violet-400/10',
    ring: 'ring-violet-500/20 dark:ring-violet-400/20',
    statusColor: 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400',
  },
] as const;

/** Сколько карточек «Популярные мастера» на главной */
export const POPULAR_MASTERS_HOME_LIMIT = 8;
