import { Button } from '@/components/ui/button';
import { CharognardIcon } from '@/components/icons/charognard-icon';
import APP from '@/constants/app';

interface FloatingButtonProps {
  isOpen: boolean;
  isHidden: boolean;
  onToggle: () => void;
}

export function FloatingButton({ isOpen, isHidden, onToggle }: FloatingButtonProps) {
  if (isHidden) return null;

  return (
    <Button
      id="onboarding-floating-button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={`fixed bottom-36 md:bottom-24 right-8 z-9998 size-14! rounded-full before:rounded-full shadow-md ${
        isOpen ? 'border-foreground' : ''
      }`}
      title={APP.NAME}
    >
      <CharognardIcon className="size-6" />
    </Button>
  );
}
