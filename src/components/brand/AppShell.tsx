import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/brand/VisuallyHidden';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { BrandLogo } from './BrandLogo';
import type { ReactNode } from 'react';

const COLLAPSE_KEY = 'educare-sidebar-collapsed';

interface AppShellProps {
  children: ReactNode;
  /** Optional footer slot (consumers can pass the existing legal footer). */
  footer?: ReactNode;
}

export function AppShell({ children, footer }: AppShellProps) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  // Close mobile drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore storage errors */
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <AppSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
      </div>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60 bg-surface border-r border-border">
          <VisuallyHidden>
            <SheetTitle>Navigation</SheetTitle>
          </VisuallyHidden>
          <AppSidebar
            collapsed={false}
            forceExpanded
            onToggleCollapse={() => undefined}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header
          className={cn(
            'md:hidden sticky top-0 z-40 h-14 bg-surface/95 backdrop-blur-sm border-b border-border',
            'flex items-center justify-between px-4',
          )}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="p-2 -ml-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo size="sm" shape="lockup" />
          <span className="w-9" aria-hidden="true" />
        </header>

        <main className="flex-1 min-w-0">
          {children}
        </main>

        {footer}
      </div>
    </div>
  );
}
