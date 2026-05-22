import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { useReducedMotionPreference } from '@/hooks/useReducedMotionPreference';

interface ScrollRevealProps {
    children: ReactNode;
    /** Extra Tailwind classes on the wrapper */
    className?: string;
    /** Delay in seconds (default 0) */
    delay?: number;
    /** Animation duration in seconds (default 0.5) */
    duration?: number;
    /** Direction the element slides in from */
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    /** Distance in px to slide (default 24) */
    distance?: number;
    /** Fraction of viewport when animation triggers (default 0.15) */
    threshold?: number;
    /** Whether to animate only once (default true) */
    once?: boolean;
}

const getVariants = (
    direction: ScrollRevealProps['direction'] = 'up',
    distance: number = 24,
): Variants => {
    const offscreen: Record<string, number> = { opacity: 0 };
    if (direction === 'up') offscreen.y = distance;
    else if (direction === 'down') offscreen.y = -distance;
    else if (direction === 'left') offscreen.x = distance;
    else if (direction === 'right') offscreen.x = -distance;

    return {
        hidden: offscreen,
        visible: { opacity: 1, x: 0, y: 0 },
    };
};

/**
 * Wraps children in a framer-motion div that fades/slides in when scrolled into view.
 *
 * Usage:
 * ```tsx
 * <ScrollReveal>
 *   <Card />
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
    children,
    className,
    delay = 0,
    duration = 0.55,
    direction = 'up',
    distance = 16,
    threshold = 0.15,
    once = true,
}: ScrollRevealProps) {
    const reduceMotion = useReducedMotionPreference();
    const variants = getVariants(direction, distance);

    if (reduceMotion) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: threshold }}
            variants={variants}
            transition={{
                duration,
                delay,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {children}
        </motion.div>
    );
}
