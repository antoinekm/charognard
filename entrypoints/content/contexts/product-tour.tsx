import { createContext, useState, useCallback, type ReactNode } from 'react';

export interface TourData {
  developerFollowed?: boolean;
}

export interface ProductTourContextValue {
  currentTour: string | null;
  currentStep: number;
  isVisible: boolean;
  tourData: TourData;
  startTour: (tourId: string, data?: TourData) => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTour: () => void;
  setStep: (step: number) => void;
}

export const ProductTourContext = createContext<ProductTourContextValue | null>(null);

interface ProductTourProviderProps {
  children: ReactNode;
}

export function ProductTourProvider({ children }: ProductTourProviderProps) {
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tourData, setTourData] = useState<TourData>({});

  const startTour = useCallback((tourId: string, data?: TourData) => {
    setCurrentTour(tourId);
    setCurrentStep(0);
    setIsVisible(true);
    setTourData(data || {});
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const closeTour = useCallback(() => {
    setIsVisible(false);
    setCurrentTour(null);
    setCurrentStep(0);
    setTourData({});
  }, []);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  return (
    <ProductTourContext.Provider
      value={{
        currentTour,
        currentStep,
        isVisible,
        tourData,
        startTour,
        nextStep,
        prevStep,
        closeTour,
        setStep,
      }}
    >
      {children}
    </ProductTourContext.Provider>
  );
}
