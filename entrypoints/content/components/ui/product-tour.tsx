import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductTour } from '../../hooks/use-product-tour';
import { TourCard } from './tour-card';
import { setOnboardingCompleted } from '@/lib/storage/onboarding';
import type { Tour } from '@/types/product-tour';
import APP from '@/constants/app';

// Tour steps definition
export const productTourSteps: Tour[] = [
  {
    tour: 'main',
    steps: [
      {
        icon: <>👋</>,
        title: `Welcome to ${APP.SHORT_NAME}`,
        content: (
          <>Let me show you around! This quick tour will help you discover all the features.</>
        ),
        selector: '#onboarding-panel-header',
        side: 'bottom',
        pointerPadding: 8,
        pointerRadius: 12,
      },
      {
        icon: <>🔍</>,
        title: 'Discover Suggestions',
        content: (
          <>
            Find new accounts to follow based on Instagram's recommendations. Select multiple
            profiles and follow them with one click.
          </>
        ),
        selector: '#onboarding-tab-suggestions',
        side: 'bottom',
        pointerPadding: 4,
        pointerRadius: 8,
        clickOnEnter: true,
      },
      {
        icon: <>💜</>,
        title: 'Track Your Follows',
        content: (
          <>
            See everyone you've followed and check who follows you back. Easily unfollow accounts
            that don't reciprocate.
          </>
        ),
        selector: '#onboarding-tab-followed',
        side: 'bottom',
        pointerPadding: 4,
        pointerRadius: 8,
        clickOnEnter: true,
      },
      {
        icon: <>⚙️</>,
        title: 'Configure Settings',
        content: <>Set daily limits to stay safe and configure automation for hands-free growth.</>,
        selector: '#onboarding-tab-settings',
        side: 'bottom',
        pointerPadding: 4,
        pointerRadius: 8,
        clickOnEnter: true,
      },
      {
        icon: <>📜</>,
        title: 'View History',
        content: (
          <>Keep track of all your actions with a detailed log of follows, unfollows, and more.</>
        ),
        selector: '#onboarding-tab-history',
        side: 'bottom',
        pointerPadding: 4,
        pointerRadius: 8,
        clickOnEnter: true,
      },
      {
        icon: <>🚀</>,
        title: "You're all set!",
        content: <>Start exploring suggestions and grow your Instagram presence. Have fun!</>,
        selector: '#onboarding-floating-button',
        side: 'left',
        pointerPadding: 8,
        pointerRadius: 24,
      },
    ],
  },
];

interface ProductTourProps {
  steps: Tour[];
  shadowRgb?: string;
  shadowOpacity?: string;
  container: HTMLElement;
}

export function ProductTour({
  steps,
  shadowRgb = '0, 0, 0',
  shadowOpacity = '0.5',
  container,
}: ProductTourProps) {
  const { currentTour, currentStep, isVisible, tourData, nextStep, prevStep, closeTour } = useProductTour();

  const [pointerPosition, setPointerPosition] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const currentTourSteps = steps.find((tour) => tour.tour === currentTour)?.steps;
  const step = currentTourSteps?.[currentStep];
  const totalSteps = currentTourSteps?.length ?? 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Find element in Shadow DOM
  const findElement = useCallback(
    (selector: string): HTMLElement | null => {
      // First try in shadow root
      const shadowElement = container.querySelector(selector) as HTMLElement | null;
      if (shadowElement) return shadowElement;
      // Fallback to document (for elements outside shadow DOM)
      return document.querySelector(selector) as HTMLElement | null;
    },
    [container]
  );

  // Get element position relative to viewport
  const getElementPosition = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  // Update pointer position
  const updatePosition = useCallback(() => {
    if (!step?.selector) return;
    const element = findElement(step.selector);
    if (element) {
      setPointerPosition(getElementPosition(element));
    }
  }, [step?.selector, findElement, getElementPosition]);

  // Update position when step changes
  useEffect(() => {
    if (isVisible && step?.selector) {
      // Close panel on last step to show the floating button
      if (isLastStep) {
        document.dispatchEvent(new CustomEvent('charognard:close-panel'));
      }

      // Click element if clickOnEnter is true
      if (step.clickOnEnter) {
        const element = findElement(step.selector);
        if (element) {
          element.click();
        }
      }

      // Small delay to let panel close/tab switch before finding element
      setTimeout(() => {
        const element = findElement(step.selector);
        if (element) {
          // Scroll element into view if needed
          const rect = element.getBoundingClientRect();
          const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
          if (!isInViewport) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          updatePosition();
        }
      }, 100);
    }
  }, [isVisible, step, isLastStep, findElement, updatePosition]);

  // Update on resize/scroll
  useEffect(() => {
    if (!isVisible) return;

    const handleUpdate = () => updatePosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isVisible, updatePosition]);

  // Handle close (marks onboarding complete and closes panel)
  const handleClose = useCallback(() => {
    setOnboardingCompleted(tourData.developerFollowed ?? false);
    closeTour();
    // Close the panel after tour ends
    document.dispatchEvent(new CustomEvent('charognard:close-panel'));
  }, [closeTour, tourData.developerFollowed]);

  // Handle next/close
  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleClose();
    } else {
      nextStep();
    }
  }, [isLastStep, handleClose, nextStep]);

  // Card positioning - margin accounts for arrow height (8px)
  const getCardStyle = (side: string = 'bottom') => {
    const styles: Record<string, React.CSSProperties> = {
      top: { transform: 'translate(-50%, 0)', left: '50%', bottom: '100%', marginBottom: 8 },
      bottom: { transform: 'translate(-50%, 0)', left: '50%', top: '100%', marginTop: 8 },
      left: { transform: 'translate(0, -50%)', right: '100%', top: '50%', marginRight: 8 },
      right: { transform: 'translate(0, -50%)', left: '100%', top: '50%', marginLeft: 8 },
    };
    return styles[side] || styles.bottom;
  };

  // Arrow SVG - points towards the highlighted element
  const getArrowStyle = (side: string = 'bottom'): React.CSSProperties => {
    const styles: Record<string, React.CSSProperties> = {
      top: { transform: 'rotate(180deg)', left: '50%', bottom: -8, marginLeft: -8 },
      bottom: { transform: 'rotate(0deg)', left: '50%', top: -8, marginLeft: -8 },
      left: { transform: 'rotate(90deg)', right: -8, top: '50%', marginTop: -8 },
      right: { transform: 'rotate(-90deg)', left: -8, top: '50%', marginTop: -8 },
    };
    return { position: 'absolute', zIndex: 10, ...(styles[side] || styles.bottom) };
  };

  const Arrow = () => (
    <svg width="16" height="9" viewBox="0 0 16 9" style={getArrowStyle(step?.side)}>
      {/* Border triangle (behind) */}
      <path d="M8 0L16 8H0L8 0Z" className="fill-border" />
      {/* Fill triangle (on top, slightly smaller) */}
      <path d="M8 1.5L14.5 8H1.5L8 1.5Z" className="fill-popover" />
    </svg>
  );

  const pointerPadding = step?.pointerPadding ?? 8;
  const pointerRadius = step?.pointerRadius ?? 8;

  if (!isVisible || !pointerPosition || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-10000 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="product-tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <motion.rect
                fill="black"
                rx={pointerRadius}
                ry={pointerRadius}
                initial={{
                  x: pointerPosition.x - pointerPadding,
                  y: pointerPosition.y - pointerPadding,
                  width: pointerPosition.width + pointerPadding * 2,
                  height: pointerPosition.height + pointerPadding * 2,
                }}
                animate={{
                  x: pointerPosition.x - pointerPadding,
                  y: pointerPosition.y - pointerPadding,
                  width: pointerPosition.width + pointerPadding * 2,
                  height: pointerPosition.height + pointerPadding * 2,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`rgba(${shadowRgb}, ${shadowOpacity})`}
            mask="url(#product-tour-mask)"
          />
        </svg>

        {/* Card */}
        <motion.div
          className="absolute pointer-events-auto"
          initial={{
            opacity: 0,
            scale: 0.9,
            left: pointerPosition.x - pointerPadding,
            top: pointerPosition.y - pointerPadding,
            width: pointerPosition.width + pointerPadding * 2,
            height: pointerPosition.height + pointerPadding * 2,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            left: pointerPosition.x - pointerPadding,
            top: pointerPosition.y - pointerPadding,
            width: pointerPosition.width + pointerPadding * 2,
            height: pointerPosition.height + pointerPadding * 2,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="absolute overflow-visible" style={getCardStyle(step.side)}>
            <TourCard
              step={step}
              currentStep={currentStep}
              totalSteps={totalSteps}
              nextStep={handleNext}
              prevStep={prevStep}
              close={handleClose}
              arrow={<Arrow />}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
