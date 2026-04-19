import { Link, Outlet } from 'react-router-dom';
import { AppShell } from '@/components/brand';

export default function ExamPrepLayout() {
  return (
    <AppShell footer={<LegalFooter />}>
      <Outlet />
    </AppShell>
  );
}

function LegalFooter() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="container-custom py-8">
        <div className="flex flex-col items-center text-center gap-5 max-w-3xl mx-auto">
          {/* Brand */}
          <div>
            <p className="font-montserrat font-semibold text-foreground text-sm">
              EduCare Exam Prep Studio
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              EduCare LLC · Redlands, CA ·{' '}
              <a
                href="https://educarecomplete.com"
                className="underline hover:text-foreground"
                target="_blank"
                rel="noreferrer"
              >
                educarecomplete.com
              </a>
            </p>
          </div>

          {/* Legal links — spread evenly on wide screens, wrap gracefully on narrow */}
          <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-border hidden sm:inline">·</span>
            <Link to="/terms" className="hover:text-foreground underline">
              Terms of Service
            </Link>
            <span aria-hidden="true" className="text-border hidden sm:inline">·</span>
            <Link to="/disclaimers" className="hover:text-foreground underline">
              Disclaimers
            </Link>
          </nav>

          {/* Disclaimer */}
          <div className="text-xs text-subtle leading-relaxed">
            <p>
              Educational study aid only. Not affiliated with the BBS, NBCC, or ASWB. Does not
              replace legal consultation, supervision, or clinical judgment.
            </p>
            <p className="mt-1">
              Verify legal and regulatory matters against primary sources.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
