# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# EduCare Exam Prep — Project Instructions

## Common Commands

```bash
npm run dev        # Vite dev server on http://localhost:3000
npm run build      # Production build to dist/
npm run preview    # Preview the production build locally
npm run lint       # ESLint across the repo
```

**No test runner is configured** (no Jest/Vitest/Playwright in `package.json`). Don't go hunting for one — add it explicitly if tests are needed.

**Path alias:** `@/*` resolves to `src/*` (configured in `vite.config.ts` and `tsconfig.json`). Use `@/lib/...`, `@/components/...`, etc. in imports.

**Supabase Edge Functions** (deployed separately from the frontend):
```bash
supabase functions deploy generate         # Gemini AI generation
supabase functions deploy checkout         # Stripe Checkout session
supabase functions deploy stripe-webhook   # Subscription sync (uses service role)
supabase functions deploy billing-portal   # Stripe billing portal

supabase secrets set GEMINI_API_KEY=...    # Set function secrets
supabase db push                           # Apply migrations in supabase/migrations/
```

**Vercel:** auto-deploys on push to `master`. Set production env vars with `vercel env add VAR_NAME production`, then redeploy.

---

## Database Access Pattern (Critical Invariant)

The codebase enforces a strict split between client and server Supabase access — violating this breaks RLS:

- **Client (browser):** uses `VITE_SUPABASE_ANON_KEY` with the authenticated user's JWT. All reads/writes go through RLS policies. Never put the service role key in any `VITE_*` variable.
- **Edge functions:** use the anon key + user JWT for user-scoped operations (`generate`, `checkout`, `billing-portal`). Only `stripe-webhook` uses `SUPABASE_SERVICE_ROLE_KEY`, because Stripe calls it unauthenticated and it must write to the `subscriptions` table on the user's behalf.
- AI API keys (Gemini) and Stripe secret keys live only in Supabase Edge Function secrets — never in the frontend bundle.

---

## Product Overview

This is **EduCare Exam Prep**, an AI-driven web application built by EduCare LLC (Redlands, CA). The app serves candidates preparing for California mental health licensing exams. It combines two core functions: a personalized study plan generator (curriculum creator) and an adaptive content engine (study tool) that produces practice questions, clinical simulations, flashcards, and review material.

**Founder:** Adam Sipes
**Company:** EduCare LLC | educarecomplete.com
**Product type:** SaaS web app (mobile-native version planned for future phase)

---

## Exam Tracks

The app supports four exam tracks. Every feature, content generator, and UI flow must be aware of which track the user has selected, because the exam format, content domains, and regulatory framework differ significantly across tracks.

### Track 1: California Law and Ethics Exam (BBS)
- **Administered by:** California Board of Behavioral Sciences (BBS)
- **Shared across:** LMFT, LPCC, LCSW candidates
- **Format:** 75 multiple-choice questions, computer-based
- **Governing law:** California Business and Professions Code (BPC), California Code of Regulations Title 16, HIPAA (45 CFR Parts 160/164), FERPA (20 U.S.C. § 1232g), Tarasoff, CAMFT/NASW/ACA ethics codes, mandated reporting (CANRA — Penal Code § 11164–11174.3), Lanterman-Petris-Short Act, elder/dependent adult abuse reporting
- **Content domains:** Scope of practice, confidentiality and privilege, informed consent, mandated reporting, dual relationships and boundaries, supervision requirements, telehealth regulations, documentation and recordkeeping, advertising and business practices, legal and ethical decision-making
- **Key differentiator:** This is the exam where EduCare can add the most value. Existing prep resources are fragmented. The app should treat this track as the flagship.

### Track 2: California MFT Clinical Exam (BBS)
- **Administered by:** California Board of Behavioral Sciences (BBS)
- **Format:** 170 multiple-choice questions (150 scored, 20 pretest), computer-based
- **Content domains:** Crisis and clinical assessment, treatment planning, clinical intervention, ethics and law (clinical application), diversity and social justice considerations, relational/systemic theories, DSM-5-TR diagnosis
- **Key differentiator:** State-specific exam with limited prep resources compared to national exams. Strong opportunity.

### Track 3: NCMHCE (NBCC) — for LPCCs
- **Administered by:** National Board for Certified Counselors (NBCC)
- **Format:** 10 clinical simulations, each with information-gathering and decision-making sections. NOT standard multiple choice — uses a clinical mental health simulation format.
- **Content domains:** Assessment and diagnosis, counseling and psychotherapy, administration/consultation/supervision, professional practice and ethics
- **Key differentiator:** The simulation format is unique. The AI content engine MUST generate content that mirrors this format — clinical vignettes with branching decision points, not just MCQs. This is non-negotiable for NCMHCE track content.

### Track 4: ASWB Clinical Exam — for LCSWs
- **Administered by:** Association of Social Work Boards (ASWB)
- **Format:** 170 multiple-choice questions (150 scored, 20 pretest), computer-based
- **Content domains:** Human development and behavior, assessment and intervention planning, interventions with clients/client systems, professional relationships/values/ethics
- **Key differentiator:** Competitive market (TDC, SWTP, Agents of Change exist). EduCare differentiates by integrating California-specific law and ethics content alongside the national clinical content, which competitors generally don't do.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build tool | Vite | Dev server on port 3000, SWC for fast compilation |
| Frontend | React 18 + React Router + Tailwind CSS | Client-side SPA, utility-first styling, mobile-responsive |
| State | React Context + TanStack React Query | ExamPrepContext for app state, React Query for server state |
| UI library | shadcn/ui | Pre-built accessible components (cards, dialogs, forms, etc.) |
| Database | Supabase (PostgreSQL) | Auth, user profiles, study plans, progress data, RLS-enforced |
| AI | Gemini 2.0 Flash (Google) | Via Supabase Edge Function — API key stays server-side |
| Payments | Stripe | Checkout, webhooks, and billing portal via Supabase Edge Functions |
| Deployment | Vercel | Static SPA with SPA fallback routing (`vercel.json`) |
| Future mobile | React Native + NativeWind | Planned — architecture decisions now should not block this |

---

## Project Structure

```
exam-prep-studio/
├── CLAUDE.md                        # This file
├── INDEX.md                         # Study reference library navigation
├── AI_REFERENCE_PROMPT.md           # AI curriculum generation instructions
├── 01_California_Law_and_Ethics/    # CA Law & Ethics exam reference guide
├── 02_NCMHCE_LPCC/                 # NCMHCE exam reference guide
├── 03_LMFT_Clinical_Exam/          # LMFT Clinical exam reference guide
├── 04_ASWB_Clinical_LCSW/          # ASWB Clinical exam reference guide
├── 05_Practice_Questions/           # Practice questions across all exams
├── 06_Free_Resources/               # Free resource master list
├── src/
│   ├── main.tsx                     # React root mount
│   ├── App.tsx                      # Router, providers, route definitions
│   ├── index.css                    # Tailwind imports + global styles
│   ├── contexts/
│   │   └── ExamPrepContext.tsx       # Central app state (license, content, generation)
│   ├── pages/
│   │   ├── exam-prep/
│   │   │   ├── ExamPrepLanding.tsx   # Public landing/marketing page
│   │   │   ├── ExamPrepAuth.tsx      # Sign in / sign up
│   │   │   ├── ExamPrepDashboard.tsx # Progress dashboard (domain scores, readiness)
│   │   │   ├── ExamPrepGenerator.tsx # AI content generator (input + output panels)
│   │   │   ├── ExamPrepQuiz.tsx      # Quiz engine (study + test modes, MCQ + vignette)
│   │   │   ├── ExamPrepSaved.tsx     # Saved materials with folder organization
│   │   │   ├── ExamPrepStudyPlan.tsx # Week-by-week study plan view
│   │   │   ├── ExamPrepAssessment.tsx# Self-assessment + AI study plan generation
│   │   │   └── ExamPrepUpgrade.tsx   # Pro subscription upgrade + billing
│   │   └── admin/
│   │       ├── AdminDashboard.tsx    # Admin overview (KB count, audit stats)
│   │       ├── AdminKnowledgeBase.tsx# KB CRUD (corrections, regulatory content)
│   │       └── AdminAuditLog.tsx     # Generation audit log (flag, notes, review)
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── exam-prep/                # App layout (ExamPrepLayout)
│   │   ├── auth/                     # AuthGuard route protection
│   │   └── admin/                    # AdminGuard + AdminLayout
│   ├── hooks/
│   │   ├── use-auth.ts               # Auth state + profile (isAdmin, subscription)
│   │   ├── use-mobile.tsx            # Mobile breakpoint detection
│   │   └── use-toast.ts              # Toast notifications
│   ├── lib/
│   │   ├── exam-prep-ai.ts           # AI generation orchestrator (prompt building, KB injection, edge function calls)
│   │   ├── exam-prep-storage.ts      # Supabase CRUD (materials, folders, quizzes, assessments, domain scores)
│   │   ├── kb-retrieval.ts           # Knowledge base retrieval + relevance scoring
│   │   ├── audit-log.ts              # Generation audit logging + admin flagging
│   │   ├── validation.ts             # Zod schemas for AI response validation
│   │   └── utils.ts                  # Tailwind merge utility
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts             # Supabase client singleton
│   │       └── types.ts              # Generated TypeScript types for DB schema
│   └── data/
│       └── exam-prep-data.ts         # Static exam data (domains, mock questions, flashcards)
├── supabase/
│   ├── config.toml                   # Supabase project config
│   ├── migrations/                   # Database schema migrations (5 files)
│   └── functions/
│       ├── generate/index.ts         # Gemini 2.0 Flash AI generation (auth, rate limit, structured JSON)
│       ├── checkout/index.ts         # Stripe Checkout session creator
│       ├── stripe-webhook/index.ts   # Stripe webhook handler (service role, subscription sync)
│       └── billing-portal/index.ts   # Stripe billing portal session creator
├── public/
│   └── favicon.svg
├── index.html                        # Vite entry point
├── vite.config.ts                    # Vite config (SWC, path aliases)
├── vercel.json                       # Vercel SPA routing config
├── tailwind.config.ts
├── tsconfig.json
├── components.json                   # shadcn/ui config
└── .env.example                      # Environment variable template
```

---

## Core User Flows

### Flow 1: Onboarding
1. User creates account (Supabase auth — email/password or Google OAuth)
2. User selects license type (LMFT, LPCC, LCSW)
3. App determines available exam tracks based on selection:
   - LMFT → CA Law & Ethics + CA MFT Clinical Exam
   - LPCC → CA Law & Ethics + NCMHCE
   - LCSW → CA Law & Ethics + ASWB Clinical
4. User selects which exam(s) they are preparing for
5. User chooses pathway:
   - **Option A: Diagnostic Assessment** → App delivers a 25–40 question diagnostic, scores it by content domain, and generates a personalized study plan weighted toward weak areas
   - **Option B: Custom Timeline** → User inputs their exam date and available study hours per week, and the app generates a structured study plan that covers all domains within that timeframe

### Flow 2: Study Plan Generation (Gemini 2.0 Flash via Edge Function)
- Input: Exam track, self-assessment ratings + weak areas, user preferences
- Output: A 6–8 week study plan with weekly focus topics, material types, review cadence, and practice frequency
- The plan must be stored in Supabase and editable by the user
- The plan must adapt: if the user's practice scores show persistent weakness in a domain, the plan should surface more content in that area

### Flow 3: Active Study Session (Gemini 2.0 Flash via Edge Function)
- User opens a study session from their dashboard
- App serves content matched to today's study plan topic and exam track:
  - **MCQ mode:** Timed or untimed multiple-choice questions with detailed rationales
  - **Flashcard mode:** Key terms, laws, ethical principles, diagnostic criteria
  - **Simulation mode (NCMHCE only):** Clinical vignettes with branching decision trees
  - **Law & Ethics scenario mode:** Fact patterns with "what would you do" analysis
- After each session, results are saved to Supabase and progress is updated on the dashboard

### Flow 4: Progress Dashboard
- Visual progress by content domain (bar chart or radar chart)
- Overall readiness score (percentage-based estimate)
- Study streak tracker
- Upcoming study plan items
- Weak area alerts

---

## AI Content Generation Rules

These rules apply to ALL content generated by the AI (Gemini 2.0 Flash) within this app. They are non-negotiable.

### Accuracy Standards
- Every legal citation must reference the actual statute, code section, or regulation (e.g., "BPC § 4999.90" not "California law states...")
- DSM-5-TR diagnostic criteria must be accurate to the published manual — do not fabricate or approximate criteria
- Ethical code references must cite the specific standard (e.g., "ACA Code of Ethics, Section A.4.b" not "the ethics code says...")
- When California law differs from federal law or another state's law, the app must explicitly flag this
- If content accuracy cannot be guaranteed for a specific question, the app should flag it for review rather than serve it

### Content Quality Standards
- Questions must be written at the difficulty level of the actual exam, not easier
- Rationales must explain WHY the correct answer is correct AND why each distractor is wrong
- Clinical vignettes must reflect realistic practice scenarios — no absurd or obvious setups
- Flashcards must be concise (front: question or term, back: answer or definition, max 2 sentences)
- All content must be written as if by a licensed practitioner, not as an AI summary

### NCMHCE Simulation Standards
- Each simulation must present a clinical vignette (150–300 words)
- Information-gathering section: present 8–12 possible actions, user selects which are appropriate
- Decision-making section: present clinical decision points with ranked options
- Scoring must mirror NCMHCE logic: actions are rated as "most appropriate," "appropriate but not ideal," "inappropriate but not harmful," or "harmful"
- Simulations must cover the full range of DSM-5-TR diagnoses and clinical scenarios

### California Law & Ethics Standards
- Content must reflect current California BPC, Title 16 CCR, and relevant case law
- Must cover BBS-specific requirements: supervision hours, experience categories, exam eligibility
- Must address California-specific mandated reporting requirements (CANRA), LPS Act, Tarasoff duty, elder/dependent adult abuse
- Must distinguish between LMFT, LPCC, and LCSW scope of practice where they differ
- Must address telehealth regulations specific to California

---

## Database Schema (Supabase)

The following tables are implemented with RLS enabled on all tables:

- **profiles** — extends auth.users; id, email, name, preferred_license, subscription_status, stripe_customer_id, daily_generations, is_admin
- **exam_prep_materials** — saved study materials; user_id, name, license_type, study_format, topic, content (JSONB), is_favorite, folder_id, tags
- **exam_prep_folders** — folder organization for saved materials; user_id, name
- **exam_prep_quiz_sessions** — quiz history; user_id, license_type, mode (study/test), questions (JSONB), results (JSONB), score, format, topic
- **exam_prep_usage** — generation usage tracking (append-only); user_id, generation_type, license_type, topic
- **exam_prep_assessments** — self-assessment + AI study plans; user_id, license_type, ratings (JSONB), weak_areas, strong_areas, suggested_plan (JSONB), completed_weeks
- **exam_prep_domain_scores** — accumulated quiz performance by domain; user_id, license_type, domain_id, domain_name, total_questions, correct_answers (unique on user+license+domain)
- **subscriptions** — Stripe subscription tracking (read-only for users, written by webhook via service role); user_id, stripe_subscription_id, status, period dates
- **admin_knowledge_base** — admin-managed reference content injected into AI prompts; title, category, content, tags, license_types, topics
- **audit_log** — full generation audit trail; user_id, prompt_text, output_text, system_prompt, model_used, generation_time_ms, flagged, admin_notes, kb_entries_used

**RPC functions:**
- `upsert_domain_score(p_user_id, p_license_type, p_domain_id, p_domain_name, p_correct, p_total)` — atomic upsert to prevent race conditions

---

## Environment Variables

**Frontend (Vite — prefixed with `VITE_`, embedded in client bundle):**
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_MONTHLY_PRICE_ID=price_xxx    # Stripe price ID for monthly plan ($24/mo)
VITE_STRIPE_BIANNUAL_PRICE_ID=price_xxx   # Stripe price ID for 6-month plan ($119)
```

**Supabase Edge Functions (set as Supabase secrets, NOT exposed to frontend):**
```
GEMINI_API_KEY=            # Google Gemini 2.0 Flash API key
STRIPE_SECRET_KEY=         # Stripe secret key (sk_test_... or sk_live_...)
STRIPE_WEBHOOK_SECRET=     # Stripe webhook signing secret (whsec_...)
SUPABASE_URL=              # Auto-set by Supabase
SUPABASE_ANON_KEY=         # Auto-set by Supabase
SUPABASE_SERVICE_ROLE_KEY= # Auto-set by Supabase (used by stripe-webhook only)
```

---

## Development Guidelines

### Code Standards
- TypeScript strict mode — no `any` types
- All Supabase Edge Functions must validate input and handle errors gracefully
- AI generation calls must include timeout handling (30s default, 45s for study plans) and retry logic (2 retries with exponential backoff)
- Never expose API keys to the client — all AI and Stripe calls go through Supabase Edge Functions
- Zod validation on all AI responses before rendering (`src/lib/validation.ts`)
- RLS enforced on all Supabase tables — client uses anon key with user JWT, service role only in webhook edge function

### UX Principles
- Mobile-first responsive design (users will study on their phones)
- Fast time-to-first-question: a new user should be answering their first practice question within 3 minutes of creating an account
- Progress should feel tangible — every session updates visible metrics
- The app should feel like a knowledgeable study partner, not a sterile quiz engine

### Brand Standards
- Primary color: EduCare navy blue (match the logo)
- Clean, professional design — this is for licensed professionals, not college students
- EduCare logo appears in the header/nav
- Footer includes: EduCare LLC | educarecomplete.com | Redlands, CA

---

## Build Priorities (MVP)

Build in this order:

1. ~~**Project scaffolding** — Vite + React + Tailwind + Supabase setup~~ ✅
2. ~~**Auth flow** — Email/password + Google OAuth, AuthGuard, AdminGuard~~ ✅
3. ~~**Onboarding flow** — 3-step license selection wizard, exam track auto-mapping, pathway choice~~ ✅
4. ~~**CA Law & Ethics exam track first** — MCQ generator, flashcard generator, quiz engine~~ ✅
5. ~~**Study plan generator** — Self-assessment driven, 6–8 week AI-generated plans~~ ✅
6. ~~**Dashboard** — Domain scores, readiness score, quiz history, study plan view~~ ✅
7. ~~**Remaining exam tracks** — MFT Clinical, NCMHCE two-phase simulation (IG + DM), ASWB Clinical~~ ✅
8. ~~**Diagnostic assessment + flashcard study mode**~~ ✅
9. **Adaptive features** — Study plan adjustment based on quiz performance, weak area detection (in progress)
10. **Launch blockers** — Privacy Policy, Terms of Service, formal disclaimers, custom domain, Stripe production config
11. **Marketing** — LearnWorlds waitlist + Kit (ConvertKit) automation, SEO marketing page

---

## What This Project Is NOT

- This is NOT a CE/CEU course. It does not award continuing education credits. It is exam prep.
- This is NOT affiliated with or endorsed by the BBS, NBCC, or ASWB. The app must include a clear disclaimer.
- This is NOT a substitute for clinical training or supervision. The app must include appropriate disclaimers.
- Content generated by the AI is study material, not legal advice or clinical guidance.

---

## Reference Documents

The numbered folders at the repo root (`01_California_Law_and_Ethics/` through `06_Free_Resources/`) contain EduCare's internal study reference material, indexed by `INDEX.md`. `AI_REFERENCE_PROMPT.md` documents the AI curriculum generation approach.

These are for human/context reference. The AI generation pipeline does NOT summarize or retrieve from these files at runtime — it generates content from the model's training knowledge plus the `admin_knowledge_base` Supabase table (see `src/lib/kb-retrieval.ts`). To add verified content into AI prompts, seed `admin_knowledge_base` via the admin panel, not by pointing the generator at these folders.
