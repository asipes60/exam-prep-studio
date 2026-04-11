# EduCare Exam Prep — Project Instructions

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
| Framework | Next.js (App Router) | SSR for SEO, API routes for Claude calls |
| Frontend | React + Tailwind CSS | Utility-first styling, mobile-responsive |
| Database | Supabase (PostgreSQL) | Auth, user profiles, study plans, progress data |
| AI | Claude API (Anthropic) | Sonnet for practice content generation, Opus for study plans and clinical simulations |
| Deployment | Vercel | Auto-scaling, edge functions |
| Future mobile | React Native + NativeWind | Planned — architecture decisions now should not block this |

---

## Project Structure

```
educare-exam-prep/
├── CLAUDE.md                    # This file
├── docs/                        # Reference documents from EduCare project
│   ├── SKILL.md                 # EduCare course production system (reference for content standards)
│   ├── PROJECT_CONTEXT_PACK.docx
│   ├── nbcc_continuing_education_provider_policy.pdf
│   ├── EduCare_Logo.png
│   └── [other reference docs]
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx             # Landing / marketing page
│   │   ├── dashboard/           # User dashboard (study plan, progress)
│   │   ├── onboarding/          # Exam track selection + diagnostic or manual setup
│   │   ├── study/               # Active study session (questions, flashcards, simulations)
│   │   ├── api/                 # API routes
│   │   │   ├── generate-plan/   # Study plan generation (Claude Opus)
│   │   │   ├── generate-content/# Practice content generation (Claude Sonnet)
│   │   │   └── auth/            # Supabase auth handlers
│   │   └── layout.tsx
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Base UI (buttons, cards, inputs)
│   │   ├── exam/                # Exam-specific components (MCQ, simulation, flashcard)
│   │   ├── dashboard/           # Dashboard widgets (progress, calendar, stats)
│   │   └── onboarding/          # Onboarding flow components
│   ├── lib/                     # Utilities and configuration
│   │   ├── claude.ts            # Claude API client wrapper
│   │   ├── supabase.ts          # Supabase client
│   │   ├── exam-tracks.ts       # Exam track definitions, content domains, question formats
│   │   └── prompts/             # Prompt templates for each generation task
│   │       ├── study-plan.ts    # Study plan generation prompts
│   │       ├── mcq.ts           # Multiple-choice question prompts
│   │       ├── simulation.ts    # NCMHCE clinical simulation prompts
│   │       ├── flashcard.ts     # Flashcard generation prompts
│   │       └── law-ethics.ts    # California law and ethics specific prompts
│   ├── types/                   # TypeScript type definitions
│   └── hooks/                   # Custom React hooks
├── supabase/
│   └── migrations/              # Database schema migrations
├── public/                      # Static assets
│   └── images/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                   # API keys (ANTHROPIC_API_KEY, SUPABASE_URL, etc.)
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

### Flow 2: Study Plan Generation (Claude Opus)
- Input: Exam track, diagnostic results OR custom timeline, user's exam date
- Output: A week-by-week study plan with daily topics, recommended content types (review → practice → simulated exam), and milestone checkpoints
- The plan must be stored in Supabase and editable by the user
- The plan must adapt: if the user's practice scores show persistent weakness in a domain, the plan should surface more content in that area

### Flow 3: Active Study Session (Claude Sonnet + Opus)
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

These rules apply to ALL content generated by the Claude API within this app. They are non-negotiable.

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

Design the schema to support these core tables at minimum:

- **users** — id, email, name, license_type, created_at
- **exam_tracks** — id, user_id, track_type (enum: law_ethics, mft_clinical, ncmhce, aswb_clinical), exam_date, status
- **study_plans** — id, user_id, exam_track_id, plan_data (JSONB), created_at, updated_at
- **diagnostic_results** — id, user_id, exam_track_id, scores_by_domain (JSONB), completed_at
- **study_sessions** — id, user_id, exam_track_id, session_type (enum: mcq, flashcard, simulation, law_scenario), content_domain, score, total_questions, completed_at
- **generated_content** — id, exam_track_id, content_type, content_domain, content_data (JSONB), quality_flag, created_at

---

## Environment Variables

```
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Development Guidelines

### Code Standards
- TypeScript strict mode — no `any` types
- All API routes must validate input and handle errors gracefully
- Claude API calls must include timeout handling and retry logic
- Never expose API keys to the client — all Claude calls go through Next.js API routes
- Use React Server Components where possible, Client Components only when interactivity is required

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

1. **Project scaffolding** — Next.js + Tailwind + Supabase setup, env config, basic layout
2. **Auth flow** — Sign up, sign in, protected routes
3. **Onboarding flow** — License type selection, exam track selection, pathway choice (diagnostic vs. custom)
4. **CA Law & Ethics exam track first** — This is the flagship. Build the MCQ generator, flashcard generator, and law scenario mode for this track before touching the other three.
5. **Study plan generator** — Both diagnostic-driven and custom timeline paths
6. **Dashboard** — Progress visualization, study plan display, session launcher
7. **Remaining exam tracks** — MFT Clinical, NCMHCE (with simulation mode), ASWB Clinical
8. **Adaptive features** — Plan adjustment based on performance, weak area detection

---

## What This Project Is NOT

- This is NOT a CE/CEU course. It does not award continuing education credits. It is exam prep.
- This is NOT affiliated with or endorsed by the BBS, NBCC, or ASWB. The app must include a clear disclaimer.
- This is NOT a substitute for clinical training or supervision. The app must include appropriate disclaimers.
- Content generated by the AI is study material, not legal advice or clinical guidance.

---

## Reference Documents

The `/docs` directory contains EduCare reference materials. These are for context about the company and its standards — they are NOT the content source for exam prep material. The AI must generate exam prep content based on its training knowledge of California law, ethics codes, DSM-5-TR, and clinical practice, not by summarizing these documents.

Key references:
- `SKILL.md` — EduCare's course production system (useful for content quality standards)
- `PROJECT_CONTEXT_PACK.docx` — Full company context
- `nbcc_continuing_education_provider_policy.pdf` — NBCC ACEP policy (relevant for NCMHCE track accuracy)
- `EduCare_Logo.png` — Brand asset
