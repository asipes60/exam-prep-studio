import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ProgressRingProps {
  /** 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Color of the active arc. Falls back to primary. */
  color?: string;
  /** Content rendered in the center (defaults to the percentage). */
  children?: ReactNode;
  label?: string;
  className?: string;
}

export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  color,
  children,
  label,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="img"
      aria-label={label ?? `${Math.round(clamped)} percent`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color ?? 'hsl(var(--primary))'}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          <span className="font-montserrat font-bold text-foreground" style={{ fontSize: size / 4 }}>
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </div>
  );
}
