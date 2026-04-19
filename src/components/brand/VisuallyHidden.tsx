import type { ReactNode } from 'react';

/**
 * Hides content from sighted users while keeping it available for screen readers
 * and assistive tech. Used for required-but-decorative ARIA labels (e.g., a
 * SheetTitle Radix requires for accessibility but the design doesn't show).
 */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </span>
  );
}
