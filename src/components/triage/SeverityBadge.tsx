import { cn } from '@/lib/utils';
import type { TriageLevel } from '@/types';

interface SeverityBadgeProps {
  level: TriageLevel;
  size?: 'sm' | 'md' | 'lg';
}

const config = {
  critical: {
    label: '🔴 Critical',
    className: 'bg-red-100 text-red-700 border-red-300',
  },
  moderate: {
    label: '🟠 Moderate',
    className: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  mild: {
    label: '🟢 Mild',
    className: 'bg-green-100 text-green-700 border-green-300',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5 font-semibold',
};

export default function SeverityBadge({
  level,
  size = 'md',
}: SeverityBadgeProps) {
  const { label, className } = config[level];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        className,
        sizeConfig[size]
      )}
    >
      {label}
    </span>
  );
}