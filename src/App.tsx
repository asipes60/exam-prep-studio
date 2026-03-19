import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ExamPrepProvider } from "./contexts/ExamPrepContext";
import ExamPrepLayout from "./components/exam-prep/ExamPrepLayout";
import ExamPrepLanding from "./pages/exam-prep/ExamPrepLanding";
import ExamPrepGenerator from "./pages/exam-prep/ExamPrepGenerator";
import ExamPrepAssessment from "./pages/exam-prep/ExamPrepAssessment";
import ExamPrepQuiz from "./pages/exam-prep/ExamPrepQuiz";
import ExamPrepSaved from "./pages/exam-prep/ExamPrepSaved";
import ExamPrepAuth from "./pages/exam-prep/ExamPrepAuth";
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
            <ExamPrepProvider>
              <Routes>
                <Route element={<ExamPrepLayout />}>
                  <Route path="/" element={<ExamPrepLanding />} />
                  <Route path="/generator" element={<ExamPrepGenerator />} />
                  <Route path="/assessment" element={<ExamPrepAssessment />} />
                  <Route path="/quiz" element={<ExamPrepQuiz />} />
                  <Route path="/saved" element={<ExamPrepSaved />} />
                  <Route path="/auth" element={<ExamPrepAuth />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ExamPrepProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
