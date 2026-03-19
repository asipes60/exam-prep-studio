import { Outlet } from 'react-router-dom';
import ExamPrepNav from './ExamPrepNav';

export default function ExamPrepLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ExamPrepNav />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-montserrat font-semibold text-slate-800 text-sm">
                EduCare Exam Prep Studio
              </p>
              <p className="text-xs text-slate-500 mt-1">
                A product of EduCare — Continuing Education for Behavioral Health Professionals
              </p>
            </div>
            <div className="text-xs text-slate-400 text-center md:text-right max-w-md">
              <p>
                This tool is for educational and study support purposes only. It does not replace
                official exam prep materials, legal consultation, supervision, or clinical judgment.
              </p>
              <p className="mt-1">
                Verify legal and regulatory matters with the California BBS and authoritative sources.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
