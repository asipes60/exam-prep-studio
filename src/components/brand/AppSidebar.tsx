import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { BrandLogo } from './BrandLogo';
import {
  Home,
  BookOpen,
  CalendarDays,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  /** Active if the current path starts with any of these prefixes. */
  matches: string[];
  label: string;
  icon: LucideIcon;
  authed?: boolean;
}

const navItems: NavItem[] = [
  { to: '/today', matches: ['/today', '/dashboard'], label: 'Today', icon: Home, authed: true },
  {
    to: '/study',
    matches: ['/study', '/generator', '/quiz', '/saved'],
    label: 'Study',
    icon: BookOpen,
  },
  {
    to: '/plan',
    matches: ['/plan', '/assessment'],
    label: 'Plan',
    icon: CalendarDays,
    authed: true,
  },
  {
    to: '/account',
    matches: ['/account', '/upgrade'],
    label: 'Account',
    icon: UserCircle,
    authed: true,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  /** Force expanded layout regardless of collapsed prop (used inside the mobile drawer). */
  forceExpanded?: boolean;
}

export function AppSidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
  forceExpanded,
}: AppSidebarProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const { pathname } = useLocation();

  const isCollapsed = forceExpanded ? false : collapsed;

  const visibleItems = navItems.filter((item) => !item.authed || isAuthenticated);
  const isActive = (item: NavItem) => item.matches.some((m) => pathname.startsWith(m));

  const showUpgrade = isAuthenticated && user?.subscriptionStatus !== 'pro';

  const NavLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item);
    const Icon = item.icon;

    const link = (
      <Link
        to={item.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex items-center gap-3 rounded-md text-sm font-medium transition-colors relative',
          isCollapsed ? 'justify-center px-2.5 py-2.5' : 'px-3 py-2.5',
          active
            ? 'bg-primary-light text-primary-dark'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary"
          />
        )}
        <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (!isCollapsed) return link;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={120}>
      <aside
        className={cn(
          'h-full flex flex-col bg-surface border-r border-border transition-[width] duration-200',
          isCollapsed ? 'w-16' : 'w-60',
        )}
        aria-label="Primary"
      >
        {/* Logo header */}
        <div
          className={cn(
            'border-b border-border px-3',
            isCollapsed
              ? 'flex flex-col items-center gap-2 py-3'
              : 'flex items-center justify-between h-16',
          )}
        >
          <Link
            to={isAuthenticated ? '/today' : '/'}
            onClick={onNavigate}
            className="flex items-center"
            aria-label="EduCare Exam Prep Studio home"
          >
            {isCollapsed ? (
              <BrandLogo shape="mark" size="md" />
            ) : (
              <BrandLogo shape="lockup" size="md" subtitle="Exam Prep" />
            )}
          </Link>
          {!forceExpanded && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink key={item.to} item={item} />
          ))}
        </nav>

        {/* Footer area */}
        <div className={cn('border-t border-border p-2 flex flex-col gap-2', isCollapsed && 'items-center')}>
          {showUpgrade && !isCollapsed && (
            <Link to="/account/upgrade" onClick={onNavigate} className="block">
              <div className="rounded-md bg-gradient-to-br from-primary to-primary-dark text-primary-foreground p-3 text-xs">
                <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Go Pro
                </div>
                <p className="text-primary-foreground/80 leading-snug">
                  Unlock unlimited generations and full mock exams.
                </p>
              </div>
            </Link>
          )}

          {isAuthenticated ? (
            isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={signOut}
                    aria-label="Sign out"
                    className="h-9 w-9"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out ({user?.name})</TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-subtle truncate">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  aria-label="Sign out"
                  className="h-7 w-7 shrink-0 text-muted-foreground"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            )
          ) : (
            <Link to="/auth" onClick={onNavigate} className="block">
              <Button
                size={isCollapsed ? 'icon' : 'sm'}
                className={cn('w-full', isCollapsed && 'h-9 w-9')}
                aria-label="Sign in"
              >
                {isCollapsed ? <UserCircle className="w-4 h-4" /> : 'Sign in'}
              </Button>
            </Link>
          )}

        </div>
      </aside>
    </TooltipProvider>
  );
}
