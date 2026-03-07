import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import '@/features/portfolio/components/portfolio.css';


interface BookAgainButtonProps {
    booking: {
        id: string;
        masterId: string;
        masterSlug?: string;
        masterName?: string;
        serviceName?: string;
    };
    size?: 'sm' | 'md';
}

export const BookAgainButton = ({ booking, size = 'md' }: BookAgainButtonProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClick = () => {
        const slug = booking.masterSlug || booking.masterId;
        navigate(`/masters/${slug}?tab=booking&rebook=${booking.id}`);
    };

    return (
        <button
            className="book-again-btn"
            onClick={handleClick}
            style={size === 'sm' ? { padding: '0.375rem 0.75rem', fontSize: '0.8rem' } : {}}
            title={t('bookings.bookAgainTooltip', 'Записаться снова к этому мастеру')}
        >
            <RotateCcw className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            {t('bookings.bookAgain', 'Записаться снова')}
        </button>
    );
};
