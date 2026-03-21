import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  LayoutDashboard,
  FileText,
  Brain,
  LogOut,
  User,
  Menu,
  X,
  ClipboardCheck,
  CalendarDays,
  FolderOpen,
} from 'lucide-react';
import { useState } from 'react';

export default function ExamPrepNav() {
  const { user, isAuthenticated, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: BookOpen },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAuthenticated ? [{ to: '/plan', label: 'Study Plan', icon: CalendarDays }] : []),
    { to: '/generator', label: 'Generator', icon: FileText },
    { to: '/quiz', label: 'Quiz', icon: ClipboardCheck },
    ...(isAuthenticated ? [{ to: '/saved', label: 'My Materials', icon: FolderOpen }] : []),
    { to: '/assessment', label: 'Weak Areas', icon: Brain },
  ];

  const isActive = (path: string) => location.pathname === path;

  function handleSignOut() {
    signOut();
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="container-custom flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="font-montserrat font-bold text-slate-900 text-sm leading-none block">
              EduCare
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-none">
              Exam Prep Studio
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {user?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2 animate-fade-in">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">{user?.name}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
