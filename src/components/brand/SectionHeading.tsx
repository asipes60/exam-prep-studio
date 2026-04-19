import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SectionHeadingProps {
  children: ReactNode;
  level?: 2 | 3;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  children,
  level = 2,
  description,
  action,
  className,
}: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  const sizeClass = level === 2 ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl';

  return (
    <div className={cn('flex items-end justify-between gap-4 mb-4', className)}>
      <div>
        <Tag
          className={cn('font-montserrat font-semibold text-foreground tracking-tight', sizeClass)}
        >
          {children}
        </Tag>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
