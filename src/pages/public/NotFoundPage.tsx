import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container max-w-2xl mx-auto py-16 text-center px-4"
    >
      <p className="text-8xl font-bold text-muted-foreground/80">404</p>
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground mt-4">
        {t('common.notFound.title')}
      </h1>
      <p className="text-muted-foreground mt-4 mb-8 max-w-md mx-auto">
        {t('common.notFound.description')}
      </p>
      <Button size="lg" onClick={() => navigate('/')} className="gap-2">
        <Home className="h-5 w-5" />
        {t('common.notFound.goHome')}
      </Button>
    </motion.div>
  );
}
