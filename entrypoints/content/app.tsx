import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/theme';
import { AuthProvider } from './contexts/auth';
import { ProductTourProvider } from './contexts/product-tour';
import { ToastProvider } from '@/components/ui/toast';
import { SidePanel } from './side-panel';
import { OnboardingModal } from './components/ui/onboarding-modal';
import { FloatingButton } from './components/ui/floating-button';
import { ProductTour, productTourSteps } from './components/ui/product-tour';
import { HideButtonContext } from './contexts/hide-button';
import { useSessionStorage } from './hooks/use-session-storage';

interface AppProps {
  container: HTMLElement;
}

export function App({ container }: AppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useSessionStorage('charognard_button_hidden', false);

  const hideButton = () => {
    setIsHidden(true);
    setIsOpen(false);
  };

  // Listen for custom events to toggle/open/close panel
  useEffect(() => {
    const handleTogglePanel = () => setIsOpen((prev) => !prev);
    const handleOpenPanel = () => setIsOpen(true);
    const handleClosePanel = () => setIsOpen(false);
    document.addEventListener('charognard:toggle-panel', handleTogglePanel);
    document.addEventListener('charognard:open-panel', handleOpenPanel);
    document.addEventListener('charognard:close-panel', handleClosePanel);
    return () => {
      document.removeEventListener('charognard:toggle-panel', handleTogglePanel);
      document.removeEventListener('charognard:open-panel', handleOpenPanel);
      document.removeEventListener('charognard:close-panel', handleClosePanel);
    };
  }, []);

  // Check if we should open panel on load (from extension icon click)
  useEffect(() => {
    browser.storage.local.get('openPanelOnLoad').then((result) => {
      if (result.openPanelOnLoad) {
        setIsOpen(true);
        browser.storage.local.remove('openPanelOnLoad');
      }
    });
  }, []);

  return (
    <ThemeProvider container={container}>
      <AuthProvider>
        <ProductTourProvider>
          <ToastProvider position="bottom-left" container={container}>
            <HideButtonContext.Provider value={{ isHidden, hideButton }}>
              {/* Floating Toggle Button */}
              <FloatingButton
                isOpen={isOpen}
                isHidden={isHidden}
                onToggle={() => setIsOpen(!isOpen)}
              />

              {/* Backdrop */}
              {isOpen && (
                <div
                  className="fixed inset-0 bg-black/20 z-9998 transition-opacity"
                  onClick={() => setIsOpen(false)}
                />
              )}

              {/* Side Panel */}
              <SidePanel isOpen={isOpen} onClose={() => setIsOpen(false)} container={container} />

              {/* Onboarding Modal */}
              <OnboardingModal container={container} />

              {/* Product Tour */}
              <ProductTour steps={productTourSteps} container={container} />
            </HideButtonContext.Provider>
          </ToastProvider>
        </ProductTourProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
