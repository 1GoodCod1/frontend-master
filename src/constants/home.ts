import {
  Search,
  MessageCircle,
  ThumbsUp,
  Wrench,
  Smartphone,
  HardHat,
  Paintbrush,
  Droplets,
  Zap,
  Sofa,
  SparklesIcon,
  Truck,
  Package,
  Scissors,
  Camera,
  Car,
  TreePine,
  Home,
  DoorOpen,
  Snowflake,
  Settings,
  GraduationCap,
  PartyPopper,
  Scale,
  Calculator,
  Baby,
  PawPrint,
  Flame,
  Plug,
  Tv,
  Bug,
  LayoutGrid,
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

/** Маппинг slug категории → иконка и градиент */
export const CATEGORY_META: Record<string, { icon: LucideIcon; gradient: string }> = {
  'remont-tehniki': { icon: Wrench, gradient: 'from-orange-500 to-amber-500' },
  'remont-telefonov-pk': { icon: Smartphone, gradient: 'from-blue-500 to-sky-400' },
  stroitelstvo: { icon: HardHat, gradient: 'from-red-500 to-rose-400' },
  'otdelochnye-raboty': { icon: Paintbrush, gradient: 'from-violet-500 to-purple-400' },
  santehnika: { icon: Droplets, gradient: 'from-cyan-500 to-teal-400' },
  elektrika: { icon: Zap, gradient: 'from-yellow-500 to-amber-400' },
  mebel: { icon: Sofa, gradient: 'from-emerald-500 to-green-400' },
  'uborka-klining': { icon: SparklesIcon, gradient: 'from-sky-500 to-blue-400' },
  'kurierskie-uslugi': { icon: Truck, gradient: 'from-teal-500 to-emerald-400' },
  'gruzoperevozki-pereezdy': { icon: Package, gradient: 'from-indigo-500 to-violet-400' },
  'uslugi-krasoty': { icon: Scissors, gradient: 'from-pink-500 to-rose-400' },
  'foto-video': { icon: Camera, gradient: 'from-fuchsia-500 to-pink-400' },
  'remont-avto': { icon: Car, gradient: 'from-slate-600 to-gray-500' },
  'landshaft-sad': { icon: TreePine, gradient: 'from-lime-500 to-green-400' },
  'krovlya-fasad': { icon: Home, gradient: 'from-amber-600 to-orange-400' },
  'okna-dveri': { icon: DoorOpen, gradient: 'from-blue-600 to-indigo-400' },
  'kondicionery-ventilyaciya': { icon: Snowflake, gradient: 'from-cyan-400 to-blue-300' },
  'svarka-metalloobrabotka': { icon: Settings, gradient: 'from-gray-500 to-zinc-400' },
  'repetitorstvo-obuchenie': { icon: GraduationCap, gradient: 'from-blue-500 to-cyan-400' },
  'svadby-prazdniki': { icon: PartyPopper, gradient: 'from-rose-500 to-pink-400' },
  'yuridicheskie-uslugi': { icon: Scale, gradient: 'from-slate-500 to-gray-400' },
  'buhgalteriya-nalogi': { icon: Calculator, gradient: 'from-emerald-600 to-teal-400' },
  'uhod-za-detmi': { icon: Baby, gradient: 'from-pink-400 to-rose-300' },
  'uhod-za-zhivotnymi': { icon: PawPrint, gradient: 'from-amber-500 to-yellow-400' },
  'ritualnye-uslugi': { icon: Flame, gradient: 'from-gray-600 to-slate-500' },
  'remont-bytovoy-tehniki': { icon: Plug, gradient: 'from-orange-600 to-amber-400' },
  'ustanovka-tehniki': { icon: Tv, gradient: 'from-indigo-600 to-blue-400' },
  'dezinsektciya-deratizaciya': { icon: Bug, gradient: 'from-green-600 to-lime-400' },
};

/** Дефолтная мета для категории без маппинга */
export const CATEGORY_DEFAULT_META = { icon: LayoutGrid, gradient: 'from-primary to-primary/70' };
