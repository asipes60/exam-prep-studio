# AI Reference Guide — How to Use This Library
## Instructions for Generating On-Demand Study Curriculum

---

## PURPOSE

This file tells an AI assistant how to use the EduCare AI library to generate on-demand, personalized study curriculum for California mental health licensing exams.

---

## LIBRARY CONTENTS SUMMARY

The library covers five distinct exams across four folders:

1. **California Law & Ethics Exam** (required for LCSW, LMFT, and LPCC)
   → File: `01_California_Law_and_Ethics/CA_Law_Ethics_Complete_Guide.md`

2. **NCMHCE — National Clinical Mental Health Counseling Exam** (LPCC clinical exam)
   → File: `02_NCMHCE_LPCC/NCMHCE_Complete_Guide.md`

3. **California LMFT Clinical Exam** (LMFT clinical exam)
   → File: `03_LMFT_Clinical_Exam/LMFT_Clinical_Exam_Complete_Guide.md`

4. **ASWB Clinical Exam** (LCSW clinical exam)
   → File: `04_ASWB_Clinical_LCSW/ASWB_Clinical_Complete_Guide.md`

5. **Practice Questions** (for all four exams)
   → File: `05_Practice_Questions/Practice_Questions_All_Exams.md`

6. **Free Resources** (all exams)
   → File: `06_Free_Resources/Free_Resources_Master_List.md`

---

## HOW TO GENERATE CURRICULUM — DECISION TREE

### Step 1: Identify the exam
When a user asks for study help, determine which exam(s) they need:

- "I'm studying for my law and ethics exam" → Use File 1
- "I need help with the NCMHCE" or "I'm an LPCC candidate" → Use File 2
- "I'm studying for my California MFT exam" or "LMFT clinical exam" → Use File 3
- "I need help with the ASWB exam" or "LCSW exam" → Use File 4
- "I need practice questions" → Use File 5
- "Where can I find free resources?" → Use File 6

### Step 2: Determine what kind of curriculum to generate
Common user requests and how to respond:

| User Request | Curriculum Type | What to Include |
|---|---|---|
| "Give me a study plan" | Weekly/daily schedule | Domain order by weight, time allocation, recommended materials |
| "Quiz me on [topic]" | Practice Q&A | Draw from File 5; create original questions using study guide content |
| "Explain [concept] for the exam" | Concept deep-dive | Use relevant study guide; connect to exam-style application |
| "What should I focus on?" | Priority study guide | List domains by exam weight; identify high-yield areas |
| "I keep failing [domain]" | Targeted remediation | Deep-dive that domain; additional practice questions |
| "Create a study guide for [topic]" | Topic-specific guide | Extract relevant content from appropriate exam guide file |
| "Flashcards on [topic]" | Flashcard set | Term-definition and scenario-based Q&A pairs |

---

## CURRICULUM GENERATION TEMPLATES

### Template 1: Full Study Plan (2–4 Month Program)

**For any exam, use this structure:**

**Phase 1 (Weeks 1–2): Foundation**
- Read the complete study guide for the exam
- Identify the 4–6 content domains and their exam weight percentages
- Create a content priority list (highest weight domain first)
- Review the official exam candidate handbook (linked in Free Resources)

**Phase 2 (Weeks 3–6): Deep Content Study**
- Study each domain in depth, starting with highest-weighted
- For each domain: read → summarize → apply to scenarios
- Use flashcards for definitions and key distinctions
- Do 10–20 practice questions per topic area

**Phase 3 (Weeks 7–10): Application Practice**
- Begin taking full-length timed practice exams
- Review every incorrect answer with full rationale
- Identify persistent weak areas and re-study
- For NCMHCE: practice full case studies timed

**Phase 4 (Weeks 11–12): Final Preparation**
- Full-length timed mock exam (test simulation conditions)
- Light review of error patterns and key facts
- Rest and self-care week before exam

---

### Template 2: Topic Deep-Dive Lesson

**Structure for any specific topic:**

1. **What it is** — clear definition or explanation of the concept
2. **Why it matters on the exam** — how it's tested, which domain it falls under
3. **Key distinctions** — what candidates commonly confuse it with
4. **Clinical application** — how it looks in a scenario
5. **Practice question(s)** — exam-style Q&A with rationale
6. **Memory aids** — mnemonics, comparisons, visual frameworks

---

### Template 3: Scenario-Based Practice Session

**For NCMHCE and clinical exam preparation:**

1. Present a realistic client scenario (2–3 paragraphs)
2. Ask: What is the presenting problem?
3. Ask: What diagnosis fits best, and what ruled out alternatives?
4. Ask: What is the immediate safety concern (if any)?
5. Ask: What treatment approach is most appropriate?
6. Ask: What would be the first clinical step?
7. Provide feedback and rationale for each response

---

### Template 4: Ethics Dilemma Workshop

**For law and ethics exam and ethical reasoning on clinical exams:**

1. Present a realistic ethical dilemma scenario
2. Ask the user to identify: What is the ethical issue? What law/code applies?
3. Walk through the ethical decision-making process step by step
4. Discuss what the best answer is AND why other options are wrong
5. Connect to a specific section of the relevant ethics code

---

## HIGH-YIELD TOPIC CHEAT SHEET

These topics appear most frequently across all exams and should be prioritized in any curriculum:

### Law & Ethics
- Tarasoff (duty to warn + protect): when it applies, both actions required
- Mandated reporting: child abuse = immediate; elder abuse = immediate; past abuse by adult = NOT required
- Minors' rights: consent at 12+; minor controls privilege when self-consenting
- HIV confidentiality: written consent required; California law specific
- HIPAA: cannot withhold records for unpaid fees; psychotherapy notes have highest protection
- Advertising: must include exact license title AND number

### Clinical Content (All Exams)
- MDD: SIG E CAPS mnemonic; ≥5 symptoms ≥2 weeks; first-line treatment = CBT + medication
- Bipolar I vs. II: I = manic episode; II = hypomanic only (never full mania)
- PTSD: >1 month; 4 clusters; treatment = EMDR, TF-CBT, CPT
- BPD: 9 criteria, ≥5; treatment = DBT (always)
- Substance Use Disorder: 11 criteria; 2–3 = mild; treatment = MI + CBT + medication
- GAD: worry most days ≥6 months; ≥3/6 symptoms; treatment = CBT + SSRIs
- Adjustment Disorder vs. MDD: stressor within 3 months; resolves within 6 months

### MFT Systems Theories
- Bowen: differentiation, triangles, emotional cutoff
- Structural (Minuchin): subsystems, boundaries (enmeshed/disengaged), joining, enactment
- EFT (Johnson): 3 stages; attachment theory base; de-escalation first
- Gottman: 4 Horsemen + antidotes; bids for connection; repair attempts
- SFBT: miracle question, scaling, exceptions

### ASWB/LCSW Specific
- NASW Code of Ethics 6 core values: Service, Social Justice, Dignity, Relationships, Integrity, Competence
- Helping process order: Engagement → Assessment → Planning → Intervention → Evaluation → Termination
- When asked "what should the social worker do FIRST" → almost always something in engagement or assessment
- PIE (Person-in-Environment) = the core social work lens
- Yalom's curative factors: universality, cohesion, installation of hope, altruism, interpersonal learning

---

## CURRICULUM QUALITY STANDARDS

When generating curriculum using this library:

1. **Always ground content in exam-specific context** — connect every topic to how it appears on that exam
2. **Use scenario-based learning** — facts taught in isolation don't transfer; clinical reasoning does
3. **Include rationale, not just answers** — explain why the correct answer is right AND why others are wrong
4. **Be domain-weighted** — spend more curriculum time on higher-weighted domains
5. **Differentiate by license** — the LCSW uses NASW ethics; LMFT uses AAMFT/CAMFT; LPCC uses ACA
6. **Flag 2024–2025 updates** — California expanded "gravely disabled," updated elder abuse protocols, added interstate compact info
7. **Acknowledge state vs. national distinction** — CA Law & Ethics and CA LMFT Clinical are California-specific; NCMHCE and ASWB are national exams

---

## EXAMPLE CURRICULUM GENERATION PROMPTS

These are examples of how a user might ask for curriculum, and the ideal response approach:

**User:** "I have 6 weeks until my ASWB exam. Can you make me a study plan?"
→ Generate a 6-week plan using the ASWB domain weights. Week 1–2: Assessment/Diagnosis. Week 3: Psychotherapy/Interventions. Week 4: Human Development. Week 5: Ethics/NASW Code. Week 6: Full practice exams + review.

**User:** "Can you quiz me on mandated reporting for the California law exam?"
→ Generate 5–8 scenario-based questions on mandated reporting drawn from the CA L&E guide. Include rationales. Offer to continue with more questions or move to another topic.

**User:** "I keep confusing Bipolar I and Bipolar II. Help me understand them for the LCSW exam."
→ Use the ASWB Clinical guide content. Explain both disorders clearly. Give a comparison table. Create 2–3 practice questions that require distinguishing between them. Give a memory trick.

**User:** "Create a flashcard set on MFT theories for the California LMFT exam."
→ Generate 20–30 flashcard-style Q&A pairs covering Bowen, Structural, Strategic, EFT, Gottman, SFBT, Narrative, and Experiential theories from the LMFT guide.

**User:** "Walk me through a case study for the NCMHCE."
→ Present an NCMHCE-style case. Ask clinical questions in sequence. Provide feedback after each response. Score and debrief.

---

*This file is intended for AI use as an operational reference. Update as new exam content outlines are released by NBCC, ASWB, and BBS.*
