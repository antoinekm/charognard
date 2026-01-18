import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverPopup } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PrivacyValue = 'public' | 'private';
export type VerifiedValue = 'verified' | 'not-verified';

export interface SuggestionFilters {
  privacy: PrivacyValue[];
  verified: VerifiedValue[];
}

interface FilterButtonProps<T extends string> {
  label: string;
  values: T[];
  options: { value: T; label: string }[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
  container?: HTMLElement | null;
}

function FilterButton<T extends string>({
  label,
  values,
  options,
  onChange,
  disabled,
  container,
}: FilterButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Filtered = exactly one option selected (not both, not none)
  const isFiltered = values.length === 1;
  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  const toggleValue = (val: T) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  // Close on outside click (shadow DOM workaround)
  useEffect(() => {
    if (!open || !container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is inside the trigger or popup
      const isInsideTrigger = popoverRef.current?.contains(target);
      const isInsidePopup = target.closest('[data-slot="popover-popup"]');

      if (!isInsideTrigger && !isInsidePopup) {
        setOpen(false);
      }
    };

    // Use timeout to avoid closing immediately when opening
    const timer = setTimeout(() => {
      container.addEventListener('click', handleClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      container.removeEventListener('click', handleClick);
    };
  }, [open, container]);

  return (
    <div ref={popoverRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant={isFiltered ? 'secondary' : 'outline'}
              size="xs"
              disabled={disabled}
              className="gap-1"
            >
              {label}
              {isFiltered && (
                <span className="text-primary">: {selectedLabels[0]}</span>
              )}
              <ChevronDownIcon className="size-3 opacity-60" />
            </Button>
          }
        />
        <PopoverPopup side="bottom" align="start" sideOffset={4} className="w-40" noPadding container={container}>
          <div className="flex flex-col py-1">
            {options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-accent/50 transition-colors cursor-pointer',
                  values.includes(option.value) && 'text-primary'
                )}
              >
                <Checkbox
                  checked={values.includes(option.value)}
                  onCheckedChange={() => toggleValue(option.value)}
                  className="size-3.5"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </PopoverPopup>
      </Popover>
    </div>
  );
}

const privacyOptions: { value: PrivacyValue; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
];

const verifiedOptions: { value: VerifiedValue; label: string }[] = [
  { value: 'verified', label: 'Verified' },
  { value: 'not-verified', label: 'Not verified' },
];

interface FilterButtonsProps {
  filters: SuggestionFilters;
  onFiltersChange: (filters: SuggestionFilters) => void;
  disabled?: boolean;
  container?: HTMLElement | null;
}

export function FilterButtons({ filters, onFiltersChange, disabled, container }: FilterButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <FilterButton
        label="Privacy"
        values={filters.privacy}
        options={privacyOptions}
        onChange={(values) => onFiltersChange({ ...filters, privacy: values })}
        disabled={disabled}
        container={container}
      />
      <FilterButton
        label="Verified"
        values={filters.verified}
        options={verifiedOptions}
        onChange={(values) => onFiltersChange({ ...filters, verified: values })}
        disabled={disabled}
        container={container}
      />
    </div>
  );
}
