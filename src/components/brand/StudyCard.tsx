import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StudyCardProps {
  children: ReactNode;
  /** Make the whole card a link target. Renders as <a> if href, otherwise <div>. */
  href?: string;
  onClick?: () => void;
  /** Adds a left border accent (used to indicate status). */
  accent?: 'primary' | 'success' | 'warning' | 'destructive' | 'none';
  /** Increases hover affordance for clickable cards. */
  interactive?: boolean;
  className?: string;
}

const accentMap: Record<NonNullable<StudyCardProps['accent']>, string> = {
  primary: 'border-l-4 border-l-primary',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  destructive: 'border-l-4 border-l-destructive',
  none: '',
};

export function StudyCard({
  children,
  href,
  onClick,
  accent = 'none',
  interactive,
  className,
}: StudyCardProps) {
  const isInteractive = interactive ?? Boolean(href || onClick);

  const classes = cn(
    'block bg-surface rounded-lg border border-border shadow-soft p-5 transition-all duration-150',
    accentMap[accent],
    isInteractive && 'hover:shadow-elevated hover:border-primary/40 cursor-pointer',
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(classes, 'text-left w-full')}>
        {children}
      </button>
    );
  }

  return <div className={classes}>{children}</div>;
}
