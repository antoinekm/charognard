import type { ReactNode } from 'react';

export interface TourStep {
  icon?: ReactNode;
  title: string;
  content: ReactNode;
  selector: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showControls?: boolean;
  pointerPadding?: number;
  pointerRadius?: number;
  /** Click the element when entering this step */
  clickOnEnter?: boolean;
}

export interface Tour {
  tour: string;
  steps: TourStep[];
}

export interface TourCardProps {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  close: () => void;
  arrow: ReactNode;
}
