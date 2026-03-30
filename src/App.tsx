import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import AuthGuard from "./components/auth/AuthGuard";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminKnowledgeBase from "./pages/admin/AdminKnowledgeBase";
import AdminAuditLog from "./pages/admin/AdminAuditLog";
import NotFound from "./pages/NotFound";

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
            <AuthProvider>
            <ExamPrepProvider>
              <Routes>
                {/* Public routes */}
                <Route element={<ExamPrepLayout />}>
                  <Route path="/" element={<ExamPrepLanding />} />
                  <Route path="/auth" element={<ExamPrepAuth />} />
                  <Route path="/upgrade" element={<ExamPrepUpgrade />} />
                </Route>
                {/* Authenticated routes */}
                <Route element={<AuthGuard />}>
                  <Route element={<ExamPrepLayout />}>
                    <Route path="/dashboard" element={<ExamPrepDashboard />} />
                    <Route path="/plan" element={<ExamPrepStudyPlan />} />
                    <Route path="/generator" element={<ExamPrepGenerator />} />
                    <Route path="/assessment" element={<ExamPrepAssessment />} />
                    <Route path="/quiz" element={<ExamPrepQuiz />} />
                    <Route path="/saved" element={<ExamPrepSaved />} />
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
