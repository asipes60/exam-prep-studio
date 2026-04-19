import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const sizeMap: Record<Size, string> = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-14',
};

interface BrandLogoProps {
  size?: Size;
  /**
   * 'lockup' = full image (icon + wordmark, 2:1 aspect).
   * 'mark' = icon-only via favicon, square. Use in collapsed sidebars.
   */
  shape?: 'lockup' | 'mark';
  /**
   * Optional small product subtitle below ("Exam Prep Studio").
   * Only valid with shape='lockup'.
   */
  subtitle?: string;
  className?: string;
}

export function BrandLogo({
  size = 'md',
  shape = 'lockup',
  subtitle,
  className,
}: BrandLogoProps) {
  const sizeClass = sizeMap[size];
  const subtitleSize =
    size === 'lg' ? 'text-sm' : size === 'md' ? 'text-xs' : 'text-[10px]';

  if (shape === 'mark') {
    return (
      <img
        src="/favicon.ico"
        alt="EduCare"
        className={cn(sizeClass, 'w-auto aspect-square rounded-md', className)}
      />
    );
  }

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img src="/educare-logo.png" alt="EduCare" className={cn(sizeClass, 'w-auto')} />
      {subtitle && (
        <span
          className={cn(
            'font-poppins font-medium text-muted-foreground border-l border-border pl-2.5 leading-tight',
            subtitleSize,
          )}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}
