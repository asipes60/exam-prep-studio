import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** Numeric trend: positive = good (up arrow), negative = bad (down arrow), 0 = flat. */
  trend?: number;
  /** Extra context shown beneath the value (e.g., "vs. last week"). */
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, icon: Icon, trend, hint, className }: StatTileProps) {
  const TrendIcon = trend === undefined ? null : trend > 0 ? ArrowUp : trend < 0 ? ArrowDown : Minus;
  const trendColor =
    trend === undefined
      ? ''
      : trend > 0
        ? 'text-success'
        : trend < 0
          ? 'text-destructive'
          : 'text-muted-foreground';

  return (
    <div
      className={cn(
        'bg-surface rounded-lg border border-border shadow-soft p-5 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="p-2 rounded-md bg-primary-light text-primary-dark">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-montserrat font-bold text-3xl text-foreground tabular-nums">
          {value}
        </span>
        {TrendIcon && (
          <span className={cn('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3 h-3" aria-hidden="true" />
            {trend !== undefined && trend !== 0 && Math.abs(trend)}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
