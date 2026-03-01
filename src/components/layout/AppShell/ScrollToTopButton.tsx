import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export function ScrollToTopButton({ onClick }: Props) {
  const button = (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      aria-label="Наверх"
      className="fixed bottom-6 right-6 z-[99999] flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-600/30 bg-amber-500 text-white shadow-lg shadow-amber-900/30 hover:bg-amber-600 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-amber-400/40 dark:bg-amber-500 dark:text-white dark:shadow-amber-900/50 dark:hover:bg-amber-600"
    >
      <ChevronUp className="h-6 w-6 shrink-0" strokeWidth={2.5} />
    </motion.button>
  );
  return createPortal(button, document.body);
}
