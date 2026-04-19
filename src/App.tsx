import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./hooks/use-auth";
import { ExamPrepProvider } from "./contexts/ExamPrepContext";
import ExamPrepLayout from "./components/exam-prep/ExamPrepLayout";
import ExamPrepLanding from "./pages/exam-prep/ExamPrepLanding";
import ExamPrepGenerator from "./pages/exam-prep/ExamPrepGenerator";
import ExamPrepAssessment from "./pages/exam-prep/ExamPrepAssessment";
import ExamPrepQuiz from "./pages/exam-prep/ExamPrepQuiz";
import ExamPrepSaved from "./pages/exam-prep/ExamPrepSaved";
import ExamPrepAuth from "./pages/exam-prep/ExamPrepAuth";
import ExamPrepDashboard from "./pages/exam-prep/ExamPrepDashboard";
import ExamPrepStudyPlan from "./pages/exam-prep/ExamPrepStudyPlan";
import ExamPrepUpgrade from "./pages/exam-prep/ExamPrepUpgrade";
import ExamPrepOnboarding from "./pages/exam-prep/ExamPrepOnboarding";
import ExamPrepDiagnostic from "./pages/exam-prep/ExamPrepDiagnostic";
import ExamPrepSimulation from "./pages/exam-prep/ExamPrepSimulation";
import ExamPrepFlashcards from "./pages/exam-prep/ExamPrepFlashcards";
import ExamPrepPrivacy from "./pages/exam-prep/ExamPrepPrivacy";
import ExamPrepTerms from "./pages/exam-prep/ExamPrepTerms";
import ExamPrepDisclaimers from "./pages/exam-prep/ExamPrepDisclaimers";
import AuthGuard from "./components/auth/AuthGuard";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKnowledgeBase from "./pages/admin/AdminKnowledgeBase";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
            <ExamPrepProvider>
              <Routes>
                {/* Public routes */}
                <Route element={<ExamPrepLayout />}>
                  <Route path="/" element={<ExamPrepLanding />} />
                  <Route path="/auth" element={<ExamPrepAuth />} />
                  <Route path="/upgrade" element={<ExamPrepUpgrade />} />
                  <Route path="/account/upgrade" element={<ExamPrepUpgrade />} />
                  <Route path="/privacy" element={<ExamPrepPrivacy />} />
                  <Route path="/terms" element={<ExamPrepTerms />} />
                  <Route path="/disclaimers" element={<ExamPrepDisclaimers />} />
                </Route>
                {/* Authenticated routes */}
                <Route element={<AuthGuard />}>
                  <Route element={<ExamPrepLayout />}>
                    <Route path="/onboarding" element={<ExamPrepOnboarding />} />
                    <Route path="/today" element={<ExamPrepDashboard />} />
                    <Route path="/dashboard" element={<Navigate to="/today" replace />} />
                    <Route path="/plan" element={<ExamPrepStudyPlan />} />
                    <Route path="/study" element={<Navigate to="/generator" replace />} />
                    <Route path="/account" element={<Navigate to="/account/upgrade" replace />} />
                    <Route path="/generator" element={<ExamPrepGenerator />} />
                    <Route path="/assessment" element={<ExamPrepAssessment />} />
                    <Route path="/diagnostic" element={<ExamPrepDiagnostic />} />
                    <Route path="/quiz" element={<ExamPrepQuiz />} />
                    <Route path="/simulation" element={<ExamPrepSimulation />} />
                    <Route path="/saved" element={<ExamPrepSaved />} />
                    <Route path="/flashcards" element={<ExamPrepFlashcards />} />
                  </Route>
                </Route>
                <Route element={<AdminGuard />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/kb" element={<AdminKnowledgeBase />} />
                    <Route path="/admin/audit" element={<AdminAuditLog />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ExamPrepProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
