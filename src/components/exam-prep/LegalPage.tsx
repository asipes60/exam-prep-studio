import { ReactNode } from 'react';

type Props = {
  title: string;
  effectiveDate: string;
  children: ReactNode;
};

export default function LegalPage({ title, effectiveDate, children }: Props) {
  return (
    <div className="container-custom py-12 md:py-16 max-w-3xl">
      <header className="mb-10 pb-6 border-b border-slate-200">
        <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">Effective date: {effectiveDate}</p>
      </header>
      <div className="legal-content space-y-6 text-slate-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-montserrat text-xl md:text-2xl font-semibold text-slate-900 mt-10 mb-3 pt-2">
      {children}
    </h2>
  );
}

export function LegalH3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-montserrat text-base md:text-lg font-semibold text-slate-800 mt-6 mb-2">
      {children}
    </h3>
  );
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="text-slate-700 leading-relaxed">{children}</p>;
}

export function LegalUL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-6 space-y-2 text-slate-700 marker:text-slate-400">
      {children}
    </ul>
  );
}
