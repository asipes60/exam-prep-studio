import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, action, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 mb-6 border-b border-border',
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-poppins text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-montserrat text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </header>
  );
}
