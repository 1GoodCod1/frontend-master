import { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
    beforeSrc: string;
    afterSrc: string;
    beforeAlt?: string;
    afterAlt?: string;
    height?: number;
}

export const BeforeAfterSlider = ({
    beforeSrc,
    afterSrc,
    beforeAlt = 'Before',
    afterAlt = 'After',
    height = 320,
}: BeforeAfterSliderProps) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const getRelativePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return 50;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        return Math.max(0, Math.min(100, (x / rect.width) * 100));
    }, []);

    const handleMove = useCallback(
        (clientX: number) => {
            if (!isDragging) return;
            setSliderPosition(getRelativePosition(clientX));
        },
        [isDragging, getRelativePosition],
    );

    const handleStart = useCallback((clientX: number) => {
        setIsDragging(true);
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            setSliderPosition(Math.max(0, Math.min(100, (x / rect.width) * 100)));
        }
    }, []);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
        const onEnd = () => handleEnd();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchmove', onTouchMove);
        window.addEventListener('touchend', onEnd);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onEnd);
        };
    }, [isDragging, handleMove, handleEnd]);

    return (
        <div
            ref={containerRef}
            className="before-after-slider"
            style={{ height }}
            onMouseDown={(e) => handleStart(e.clientX)}
            onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        >
            {/* After image (full width, behind) */}
            <div className="before-after-slider__after">
                <img
                    src={afterSrc}
                    alt={afterAlt}
                    draggable={false}
                />
            </div>

            {/* Before image (clipped) */}
            <div
                className="before-after-slider__before"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeAlt}
                    draggable={false}
                />
            </div>

            {/* Slider handle */}
            <div
                className="before-after-slider__handle"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="before-after-slider__line" />
                <div className="before-after-slider__thumb">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                            d="M6 10L3 7M3 7L6 4M3 7H9M14 10L17 7M17 7L14 4M17 7H11M3 13L6 16M6 16L9 13M6 16H3M17 13L14 16M14 16L11 13M14 16H17"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="before-after-slider__labels">
                <span
                    className="before-after-slider__label before-after-slider__label--before"
                    style={{ opacity: sliderPosition > 15 ? 1 : 0 }}
                >
                    До
                </span>
                <span
                    className="before-after-slider__label before-after-slider__label--after"
                    style={{ opacity: sliderPosition < 85 ? 1 : 0 }}
                >
                    После
                </span>
            </div>
        </div>
    );
};
