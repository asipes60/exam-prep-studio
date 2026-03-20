// EduCare Exam Prep Studio - Exam Data, Topics, and Seed Content

import type {
  ExamInfo,
  TopicCategory,
  LicenseType,
  StudyFormat,
  PracticeQuestion,
  Flashcard,
  StudyGuide,
  StudyPlan,
  ClinicalVignette,
} from '@/types/exam-prep';

// ─── Topic Categories by Exam ──────────────────────────────────────────

const sharedLawEthicsTopics: TopicCategory[] = [
  {
    id: 'law_ethics',
    name: 'Law & Ethics',
    topics: [
      'Confidentiality & privilege',
      'Mandated reporting',
      'Duty to protect (Tarasoff)',
      'Informed consent',
      'Documentation & record keeping',
      'Scope of practice',
      'Supervision requirements',
      'Professional boundaries',
      'Telehealth regulations',
      'Child abuse reporting (CANRA)',
      'Elder & dependent adult abuse',
      'Minor consent laws',
      'Dual relationships',
      'Advertising & solicitation',
      'Board complaint process',
    ],
  },
];

const clinicalTopics: TopicCategory[] = [
  {
    id: 'assessment',
    name: 'Clinical Assessment & Diagnosis',
    topics: [
      'Mental status examination',
      'DSM-5-TR diagnostic criteria',
      'Risk assessment & suicide screening',
      'Biopsychosocial assessment',
      'Cultural considerations in assessment',
      'Differential diagnosis',
      'Psychological testing basics',
    ],
  },
  {
    id: 'treatment',
    name: 'Treatment Planning & Interventions',
    topics: [
      'Evidence-based treatment planning',
      'CBT fundamentals',
      'DBT skills & applications',
      'Solution-focused brief therapy',
      'Motivational interviewing',
      'Person-centered therapy',
      'Psychodynamic approaches',
      'Trauma-informed care',
      'Crisis intervention',
      'Safety planning',
    ],
  },
  {
    id: 'special_populations',
    name: 'Special Populations & Issues',
    topics: [
      'Substance use disorders',
      'Co-occurring disorders',
      'Child & adolescent counseling',
      'Older adult considerations',
      'Cultural humility & competence',
      'LGBTQ+ affirming practices',
      'Disability considerations',
      'Immigrant & refugee populations',
    ],
  },
  {
    id: 'professional',
    name: 'Professional Practice',
    topics: [
      'Supervision models',
      'Consultation & collaboration',
      'Self-care & burnout prevention',
      'Research & program evaluation',
      'Advocacy & social justice',
      'Managed care & insurance',
    ],
  },
];

const lpccSpecificTopics: TopicCategory[] = [
  {
    id: 'counseling_theory',
    name: 'Counseling Theory & Practice',
    topics: [
      'Counseling theories overview',
      'Career counseling & development',
      'Group counseling techniques',
      'Human growth & development',
      'Multicultural counseling',
      'Rehabilitation counseling',
      'School counseling considerations',
    ],
  },
];

const lmftSpecificTopics: TopicCategory[] = [
  {
    id: 'family_systems',
    name: 'Family & Systems Therapy',
    topics: [
      'Structural family therapy',
      'Strategic family therapy',
      'Bowenian family systems',
      'Narrative therapy',
      'Gottman method basics',
      'Emotionally focused therapy (EFT)',
      'Family life cycle',
      'Genograms & family mapping',
      'Couples therapy approaches',
      'Divorce & blended families',
      'Parent-child relational issues',
      'Domestic violence considerations',
    ],
  },
];

const lcswSpecificTopics: TopicCategory[] = [
  {
    id: 'social_work',
    name: 'Social Work Practice',
    topics: [
      'Systems theory & ecological model',
      'Case management',
      'Community organization',
      'Social welfare policy',
      'Macro social work practice',
      'Group work',
      'Child welfare system',
      'Healthcare social work',
      'School-based social work',
      'Aging & gerontological social work',
      'Social justice & advocacy',
      'Human behavior in the social environment',
    ],
  },
];

// ─── Exam Information ───────────────────────────────────────────────────

export const EXAM_DATA: Record<LicenseType, ExamInfo> = {
  LPCC: {
    id: 'LPCC',
    title: 'Licensed Professional Clinical Counselor',
    shortTitle: 'LPCC Exam Prep',
    description:
      'Prepare for the National Clinical Mental Health Counseling Examination (NCMHCE) and California LPCC requirements.',
    icon: 'BookOpen',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    categories: [...sharedLawEthicsTopics, ...clinicalTopics, ...lpccSpecificTopics],
  },
  LMFT: {
    id: 'LMFT',
    title: 'Licensed Marriage & Family Therapist',
    shortTitle: 'LMFT Exam Prep',
    description:
      'Prepare for the MFT California Law & Ethics Exam and national MFT licensing examinations.',
    icon: 'Users',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    categories: [...sharedLawEthicsTopics, ...clinicalTopics, ...lmftSpecificTopics],
  },
  LCSW: {
    id: 'LCSW',
    title: 'Licensed Clinical Social Worker',
    shortTitle: 'LCSW Exam Prep',
    description:
      'Prepare for the ASWB Clinical Exam and California LCSW licensing requirements.',
    icon: 'Heart',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categories: [...sharedLawEthicsTopics, ...clinicalTopics, ...lcswSpecificTopics],
  },
  LAW_ETHICS: {
    id: 'LAW_ETHICS',
    title: 'California Law & Ethics Exam',
    shortTitle: 'Law & Ethics Prep',
    description:
      'Focused preparation for the California Law & Ethics examination required for all associate-level clinicians.',
    icon: 'Scale',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    categories: [
      ...sharedLawEthicsTopics,
      {
        id: 'ca_specific',
        name: 'California-Specific Regulations',
        topics: [
          'BBS structure & functions',
          'Associate registration requirements',
          'Supervision hour requirements',
          'Continuing education requirements',
          'License renewal process',
          'Disciplinary actions & hearings',
          'Interstate practice & telehealth',
          'Business & professions code highlights',
          'Title protection & scope',
          'Fee disclosure requirements',
        ],
      },
    ],
  },
};

export const STUDY_FORMAT_OPTIONS: { id: StudyFormat; label: string; description: string; icon: string }[] = [
  { id: 'practice_questions', label: 'Practice Questions', description: 'Multiple-choice questions with rationales', icon: 'HelpCircle' },
  { id: 'scenario_questions', label: 'Scenario-Based Questions', description: 'Clinical vignettes with analysis', icon: 'FileText' },
  { id: 'clinical_vignette', label: 'Clinical Vignettes (Exam-Style)', description: 'Multi-question case studies testing multiple competencies', icon: 'ClipboardList' },
  { id: 'flashcards', label: 'Flashcards', description: 'Quick-review front/back cards', icon: 'Layers' },
  { id: 'study_guide', label: 'Study Guide', description: 'Comprehensive topic overview', icon: 'BookOpen' },
  { id: 'quick_reference', label: 'Quick Reference Sheet', description: 'At-a-glance key facts', icon: 'ClipboardList' },
  { id: 'mini_quiz', label: 'Mini Quiz', description: '5-10 question focused quiz', icon: 'CheckSquare' },
  { id: 'mock_exam', label: 'Mock Exam Set', description: 'Full-length practice exam section', icon: 'Award' },
  { id: 'law_ethics_spotter', label: 'Law & Ethics Spotter', description: 'Identify legal/ethical issues in scenarios', icon: 'Scale' },
  { id: 'rationale_review', label: 'Rationale Review', description: 'Deep-dive into why answers are correct', icon: 'Lightbulb' },
  { id: 'study_plan', label: 'Personalized Study Plan', description: 'Custom weekly study schedule', icon: 'Calendar' },
];

// ─── Seed Content ───────────────────────────────────────────────────────

export function getSeedQuestions(license: LicenseType): PracticeQuestion[] {
  const baseQuestions: PracticeQuestion[] = [
    {
      id: 'seed-q1',
      stem: 'A client tells you they plan to harm their neighbor who they believe is poisoning their water. The client names the specific individual and describes a detailed plan. Under California law, what is your MOST appropriate initial action?',
      choices: [
        { label: 'A', text: 'Contact the intended victim to warn them of the threat' },
        { label: 'B', text: 'Assess the seriousness and imminence of the threat before taking action' },
        { label: 'C', text: 'Immediately call 911 and break confidentiality' },
        { label: 'D', text: 'Document the statement and discuss it in your next supervision session' },
      ],
      correctAnswer: 'B',
      rationale:
        'Under the Tarasoff duty and California Civil Code §43.92, clinicians must first assess whether a serious threat of physical violence exists against a reasonably identifiable victim. Assessment of the threat\'s credibility and imminence is the essential first step before determining appropriate protective actions.',
      incorrectRationales: [
        { label: 'A', explanation: 'Warning the victim may be one appropriate step, but it should not occur before a thorough assessment of the threat.' },
        { label: 'C', explanation: 'Calling 911 may become appropriate, but clinical assessment of the threat must occur first to determine the level of response.' },
        { label: 'D', explanation: 'Waiting for supervision is inappropriate when there is a potential imminent threat to an identifiable person. This requires immediate assessment and action.' },
      ],
      topic: 'Duty to protect (Tarasoff)',
      difficulty: 'exam_level',
    },
    {
      id: 'seed-q2',
      stem: 'You are conducting a telehealth session with a California-based client who discloses that their 7-year-old child has unexplained bruises. The client states a relative may be responsible. What is your legal obligation?',
      choices: [
        { label: 'A', text: 'Gather more information over the next few sessions before deciding' },
        { label: 'B', text: 'Report to Child Protective Services (CPS) immediately, as you are a mandated reporter with reasonable suspicion' },
        { label: 'C', text: 'Refer the client to a child abuse specialist for evaluation' },
        { label: 'D', text: 'Document the disclosure and notify your supervisor within 48 hours' },
      ],
      correctAnswer: 'B',
      rationale:
        'Under CANRA (Child Abuse and Neglect Reporting Act), mental health professionals are mandated reporters. When there is reasonable suspicion of child abuse, a telephone report must be made to CPS or law enforcement immediately or as soon as practically possible, followed by a written report within 36 hours. You do not need to confirm abuse occurred before reporting.',
      incorrectRationales: [
        { label: 'A', explanation: 'Mandated reporters must report based on reasonable suspicion, not confirmed evidence. Delaying violates the reporting requirement.' },
        { label: 'C', explanation: 'Referring for evaluation does not fulfill your mandated reporting obligation. Investigation is the role of CPS, not a specialist you refer to.' },
        { label: 'D', explanation: 'The timeline for reporting is immediate phone contact, not 48 hours. Supervisor notification may also be appropriate, but reporting cannot be delayed.' },
      ],
      topic: 'Child abuse reporting (CANRA)',
      difficulty: 'intermediate',
    },
    {
      id: 'seed-q3',
      stem: 'A 16-year-old client requests therapy for substance use without parental consent. Under California law, which of the following is TRUE?',
      choices: [
        { label: 'A', text: 'Minors cannot consent to their own mental health treatment under any circumstances' },
        { label: 'B', text: 'Minors aged 12 and older may consent to mental health treatment related to substance use without parental consent' },
        { label: 'C', text: 'Only minors who are legally emancipated may consent to substance use treatment' },
        { label: 'D', text: 'Parental consent is always required unless the minor is in immediate danger' },
      ],
      correctAnswer: 'B',
      rationale:
        'Under California Family Code §6929, minors aged 12 and older may consent to outpatient mental health treatment or counseling services related to the diagnosis or treatment of a drug or alcohol-related problem without parental consent. The provider must involve the parent unless it would be inappropriate.',
      incorrectRationales: [
        { label: 'A', explanation: 'California law provides several exceptions where minors can consent to their own treatment, including for substance use issues.' },
        { label: 'C', explanation: 'Emancipation is not required. The law specifically allows minors 12+ to consent for substance-related treatment.' },
        { label: 'D', explanation: 'Parental consent is not universally required. California law carves out specific situations where minor consent is sufficient.' },
      ],
      topic: 'Minor consent laws',
      difficulty: 'intermediate',
    },
  ];

  const licenseSpecific: Record<LicenseType, PracticeQuestion[]> = {
    LPCC: [
      {
        id: 'seed-lpcc-1',
        stem: 'A client presenting with persistent sadness, anhedonia, sleep disturbance, and difficulty concentrating for the past three weeks is BEST assessed using which initial approach?',
        choices: [
          { label: 'A', text: 'Administer a personality inventory immediately' },
          { label: 'B', text: 'Conduct a thorough biopsychosocial assessment including a mental status examination' },
          { label: 'C', text: 'Begin CBT interventions targeting negative thought patterns' },
          { label: 'D', text: 'Refer directly to a psychiatrist for medication evaluation' },
        ],
        correctAnswer: 'B',
        rationale: 'A comprehensive biopsychosocial assessment with mental status examination is the foundational first step. This allows the clinician to understand the full picture—biological, psychological, and social factors—before determining a diagnosis or treatment approach.',
        incorrectRationales: [
          { label: 'A', explanation: 'A personality inventory may be useful later but is not the appropriate initial assessment tool for presenting mood symptoms.' },
          { label: 'C', explanation: 'Beginning interventions before completing a thorough assessment risks missing important diagnostic information and comorbid conditions.' },
          { label: 'D', explanation: 'An immediate referral to psychiatry bypasses the counselor\'s role in initial assessment and may be premature without a full clinical picture.' },
        ],
        topic: 'Clinical assessment',
        difficulty: 'intermediate',
      },
    ],
    LMFT: [
      {
        id: 'seed-lmft-1',
        stem: 'In structural family therapy, a therapist observes that a 10-year-old child frequently interrupts the parents during session, and neither parent redirects the child. The therapist identifies this as which structural concept?',
        choices: [
          { label: 'A', text: 'Enmeshment between parent and child subsystems' },
          { label: 'B', text: 'A diffuse boundary between the parental and child subsystems' },
          { label: 'C', text: 'Triangulation involving the child' },
          { label: 'D', text: 'Parentification of the child' },
        ],
        correctAnswer: 'B',
        rationale: 'In Minuchin\'s structural family therapy, diffuse boundaries indicate that the hierarchy between subsystems is unclear. The child interrupting without redirection suggests the parental subsystem boundary is not clearly defined, allowing the child to operate at the same level as the parents.',
        incorrectRationales: [
          { label: 'A', explanation: 'Enmeshment involves over-involvement and emotional fusion, which is related but not specifically what is being described here.' },
          { label: 'C', explanation: 'Triangulation involves drawing a third party into a dyadic conflict, which is not directly evidenced in this scenario.' },
          { label: 'D', explanation: 'Parentification involves the child taking on a parental role, which is different from the boundary issue described.' },
        ],
        topic: 'Structural family therapy',
        difficulty: 'exam_level',
      },
    ],
    LCSW: [
      {
        id: 'seed-lcsw-1',
        stem: 'A social worker at a community mental health center notices that many clients from a particular neighborhood lack access to transportation for appointments. From an ecological systems perspective, this barrier exists at which level?',
        choices: [
          { label: 'A', text: 'Microsystem' },
          { label: 'B', text: 'Mesosystem' },
          { label: 'C', text: 'Exosystem' },
          { label: 'D', text: 'Macrosystem' },
        ],
        correctAnswer: 'C',
        rationale: 'The exosystem includes community-level structures and resources that indirectly affect the individual, such as transportation infrastructure, community services, and local policies. The client is not directly participating in the transportation system but is affected by its limitations.',
        incorrectRationales: [
          { label: 'A', explanation: 'The microsystem involves direct, face-to-face interactions (family, therapist), not community-level infrastructure.' },
          { label: 'B', explanation: 'The mesosystem involves interactions between microsystems (e.g., family-school connection), not community resource gaps.' },
          { label: 'D', explanation: 'The macrosystem involves broad cultural values, laws, and customs, not specific community-level resource availability.' },
        ],
        topic: 'Systems theory & ecological model',
        difficulty: 'intermediate',
      },
    ],
    LAW_ETHICS: [
      {
        id: 'seed-law-1',
        stem: 'An associate clinical social worker (ASW) wants to provide telehealth services to a client who has temporarily relocated to Nevada. Under current California regulations, which statement is MOST accurate?',
        choices: [
          { label: 'A', text: 'The ASW may continue telehealth services as long as the client was initially seen in California' },
          { label: 'B', text: 'The ASW must verify whether they are permitted to provide services to the client in Nevada and comply with both states\' laws' },
          { label: 'C', text: 'Telehealth services are only regulated by the state where the clinician is located' },
          { label: 'D', text: 'Associates are prohibited from providing any telehealth services' },
        ],
        correctAnswer: 'B',
        rationale: 'When a client is physically located in another state, the clinician must consider the laws and regulations of both the state where they are licensed and the state where the client is physically present. Interstate telehealth practice is governed by the client\'s location, and many states require licensure or temporary practice agreements.',
        incorrectRationales: [
          { label: 'A', explanation: 'The initial location of treatment does not determine ongoing jurisdiction. The client\'s current physical location matters.' },
          { label: 'C', explanation: 'This is a common misconception. The client\'s state also has regulatory authority over services delivered to persons within its borders.' },
          { label: 'D', explanation: 'Associates may provide telehealth services under appropriate supervision. There is no blanket prohibition.' },
        ],
        topic: 'Telehealth regulations',
        difficulty: 'exam_level',
      },
    ],
  };

  return [...baseQuestions, ...(licenseSpecific[license] || [])];
}

export function getSeedFlashcards(license: LicenseType): Flashcard[] {
  const shared: Flashcard[] = [
    { id: 'fc-1', front: 'What is the Tarasoff duty?', back: 'The duty to protect identifiable third parties from serious threats of violence made by a client. In California, codified in Civil Code §43.92. Requires assessment, and may include warning the victim, notifying law enforcement, or taking other reasonable steps.', category: 'Law & Ethics', topic: 'Duty to protect' },
    { id: 'fc-2', front: 'What does CANRA require of mandated reporters?', back: 'The Child Abuse and Neglect Reporting Act requires mandated reporters to report known or reasonably suspected child abuse or neglect. An immediate telephone report must be made to CPS or law enforcement, followed by a written report within 36 hours.', category: 'Law & Ethics', topic: 'Mandated reporting' },
    { id: 'fc-3', front: 'What are the exceptions to confidentiality in California?', back: '1) Danger to self or others (Tarasoff)\n2) Suspected child abuse (CANRA)\n3) Suspected elder/dependent adult abuse\n4) Court order or subpoena\n5) Client consent\n6) Minor consent situations\n7) Workers\' compensation claims\n8) When required by law for public safety', category: 'Law & Ethics', topic: 'Confidentiality' },
    { id: 'fc-4', front: 'What is informed consent in therapy?', back: 'The process of providing clients with sufficient information to make autonomous decisions about their treatment. Must include: nature of therapy, risks/benefits, alternatives, confidentiality limits, fees, emergency procedures, clinician qualifications, and client rights including the right to terminate.', category: 'Law & Ethics', topic: 'Informed consent' },
    { id: 'fc-5', front: 'What is the California BBS?', back: 'The Board of Behavioral Sciences (BBS) is the regulatory body that licenses and oversees LMFTs, LCSWs, LPCCs, and LEPs in California. It processes applications, administers exams, investigates complaints, and enforces disciplinary actions.', category: 'Law & Ethics', topic: 'Professional practice' },
    { id: 'fc-6', front: 'Define cultural humility.', back: 'An ongoing process of self-reflection and self-critique where clinicians recognize their own biases and the limitations of their cultural knowledge. Unlike cultural competence (implying mastery), cultural humility emphasizes lifelong learning, power imbalances, and institutional accountability.', category: 'Special Populations', topic: 'Cultural humility' },
  ];

  const licenseCards: Record<LicenseType, Flashcard[]> = {
    LPCC: [
      { id: 'fc-lpcc-1', front: 'What are the LPCC supervision hour requirements in California?', back: 'LPCCs must accumulate 3,000 hours of supervised professional clinical counseling experience post-degree, with at least 1,750 hours in direct client contact. Supervision must include at least 1 hour of individual or triadic supervision per week.', category: 'Professional Practice', topic: 'Supervision requirements' },
    ],
    LMFT: [
      { id: 'fc-lmft-1', front: 'What is differentiation of self (Bowen)?', back: 'The ability to maintain one\'s sense of self while remaining emotionally connected to significant others. Higher differentiation = better ability to think clearly under stress, maintain "I-positions," and avoid emotional reactivity or fusion in relationships.', category: 'Family Systems', topic: 'Bowenian theory' },
    ],
    LCSW: [
      { id: 'fc-lcsw-1', front: 'What is the person-in-environment (PIE) perspective?', back: 'A core social work framework that emphasizes understanding individuals within the context of their environments. It considers the reciprocal relationship between people and their social/physical/political environments, and guides assessment and intervention at multiple system levels.', category: 'Social Work Practice', topic: 'Systems theory' },
    ],
    LAW_ETHICS: [
      { id: 'fc-law-1', front: 'When can a minor consent to their own mental health treatment in California?', back: 'Under CA Family Code §6924: Minors 12+ can consent to outpatient mental health treatment if mature enough to participate intelligently AND danger of serious harm to self/others OR alleged victim of incest/child abuse.\n\nUnder §6929: Minors 12+ can consent for drug/alcohol treatment.\n\nProvider should attempt to involve parent unless inappropriate.', category: 'Law & Ethics', topic: 'Minor consent' },
    ],
  };

  return [...shared, ...(licenseCards[license] || [])];
}

export function getSeedStudyGuide(license: LicenseType): StudyGuide {
  return {
    id: `sg-${license}-confidentiality`,
    title: `Confidentiality & Its Exceptions — ${EXAM_DATA[license].shortTitle}`,
    topic: 'Confidentiality',
    sections: [
      {
        id: 'sg-s1',
        title: 'Overview of Confidentiality in California',
        overview:
          'Confidentiality is a cornerstone of the therapeutic relationship and is protected by both California state law and professional ethical codes. However, it is not absolute. Clinicians must understand both the general duty to maintain confidentiality and the specific, legally mandated exceptions.',
        keyTerms: [
          { term: 'Confidentiality', definition: 'The ethical and legal obligation to protect client information from unauthorized disclosure.' },
          { term: 'Privilege', definition: 'The client\'s legal right to prevent their therapist from disclosing information in legal proceedings. Belongs to the client, not the therapist.' },
          { term: 'Informed Consent', definition: 'The process of clearly communicating confidentiality and its limits before treatment begins.' },
        ],
        practicalTakeaways: [
          'Always discuss confidentiality limits during the informed consent process at the start of treatment.',
          'Document that you discussed confidentiality limits and that the client understood.',
          'When in doubt about whether an exception applies, consult with a supervisor or attorney before disclosing.',
          'Only disclose the minimum necessary information when a legal exception applies.',
        ],
        commonExamTraps: [
          'Confusing confidentiality (ethical duty) with privilege (legal right in court). Privilege belongs to the client.',
          'Thinking you need "proof" before reporting suspected child abuse—reasonable suspicion is the standard.',
          'Assuming a subpoena alone is sufficient to break confidentiality—generally a court order is needed unless the client consents.',
          'Forgetting that Tarasoff requires assessment first, not automatic disclosure.',
        ],
        memoryAids: [
          'DACES for exceptions: Danger, Abuse, Court order, Elder abuse, Supervision/consultation',
          'Privilege = Client\'s right (think "P" for "Patient\'s privilege")',
          'Tarasoff = "protect and warn" but ASSESS first',
        ],
      },
    ],
  };
}

export function getSeedStudyPlan(license: LicenseType, weakAreas: string[]): StudyPlan {
  const topics = weakAreas.length > 0 ? weakAreas : ['Law & Ethics', 'Clinical Assessment', 'Treatment Planning'];
  return {
    id: `sp-${license}-${Date.now()}`,
    title: `${EXAM_DATA[license].shortTitle} — Personalized Study Plan`,
    licenseType: license,
    timeHorizon: '8 weeks',
    weeklyPlan: [
      {
        week: 1,
        focus: `Foundation Review: ${topics[0] || 'Core Concepts'}`,
        materialTypes: ['study_guide', 'flashcards'],
        reviewCadence: 'Review flashcards daily, study guide once',
        practiceFrequency: '10 practice questions at end of week',
        topics: [topics[0] || 'Core Concepts'],
      },
      {
        week: 2,
        focus: `Deep Dive: ${topics[0] || 'Core Concepts'}`,
        materialTypes: ['practice_questions', 'scenario_questions'],
        reviewCadence: 'Review missed questions daily',
        practiceFrequency: '15 practice questions, 5 scenarios',
        topics: [topics[0] || 'Core Concepts'],
      },
      {
        week: 3,
        focus: `${topics[1] || 'Assessment Skills'} — Foundation`,
        materialTypes: ['study_guide', 'flashcards', 'quick_reference'],
        reviewCadence: 'Flashcard review 2x daily, reference sheet on desk',
        practiceFrequency: '10 practice questions',
        topics: [topics[1] || 'Assessment Skills'],
      },
      {
        week: 4,
        focus: `${topics[1] || 'Assessment Skills'} — Application`,
        materialTypes: ['scenario_questions', 'mini_quiz'],
        reviewCadence: 'Mini quiz daily, review rationales',
        practiceFrequency: '20 practice questions, 1 mini quiz',
        topics: [topics[1] || 'Assessment Skills'],
      },
      {
        week: 5,
        focus: `${topics[2] || 'Treatment Planning'} — Foundation & Practice`,
        materialTypes: ['study_guide', 'practice_questions', 'flashcards'],
        reviewCadence: 'Flashcards daily, review weak areas from weeks 1-4',
        practiceFrequency: '15 practice questions',
        topics: [topics[2] || 'Treatment Planning'],
      },
      {
        week: 6,
        focus: 'Integration & Cross-Topic Review',
        materialTypes: ['scenario_questions', 'law_ethics_spotter', 'mini_quiz'],
        reviewCadence: 'Review all saved flashcards, focus on frequently missed',
        practiceFrequency: '25 mixed practice questions',
        topics: topics,
      },
      {
        week: 7,
        focus: 'Mock Exam & Targeted Review',
        materialTypes: ['mock_exam', 'rationale_review'],
        reviewCadence: 'Deep rationale review for all missed questions',
        practiceFrequency: 'Full mock exam + targeted follow-up',
        topics: topics,
      },
      {
        week: 8,
        focus: 'Final Review & Confidence Building',
        materialTypes: ['quick_reference', 'flashcards', 'mini_quiz'],
        reviewCadence: 'Light daily review, focus on high-yield areas',
        practiceFrequency: 'Light practice, avoid burnout',
        topics: topics,
      },
    ],
    weakAreas: topics,
  };
}

export function getSeedVignettes(license: LicenseType): ClinicalVignette[] {
  return [
    {
      id: 'vignette-seed-1',
      clientPresentation: 'Maria, a 34-year-old Latina woman, presents to your outpatient office appearing tearful and fatigued. She speaks softly and avoids eye contact. She reports she has not been sleeping well for the past two months and has lost interest in activities she previously enjoyed, including spending time with her two children, ages 6 and 9.',
      demographics: '34-year-old Latina female, married, two children',
      presentingProblem: 'Persistent sadness, insomnia, anhedonia, social withdrawal over 2 months',
      relevantHistory: 'Maria recently experienced the death of her mother, who was her primary support system. She has no prior mental health treatment. Her husband works long hours and she reports feeling isolated. She denies substance use. No prior suicide attempts but reports passive suicidal ideation ("sometimes I think my family would be better off without me").',
      questions: [
        {
          questionText: 'What is your most important immediate clinical priority with this client?',
          competencyArea: 'Risk Assessment',
          choices: [
            { label: 'A', text: 'Explore the grief process and cultural context of her loss' },
            { label: 'B', text: 'Conduct a thorough suicide risk assessment given her passive suicidal ideation' },
            { label: 'C', text: 'Administer the PHQ-9 to establish a baseline depression score' },
            { label: 'D', text: 'Develop a treatment plan focusing on behavioral activation' },
          ],
          correctAnswer: 'B',
          rationale: 'Passive suicidal ideation requires immediate risk assessment to determine the level of danger. While grief exploration, standardized measures, and treatment planning are all appropriate, safety assessment must come first.',
          incorrectRationales: [
            { label: 'A', explanation: 'Grief exploration is important but secondary to assessing safety when suicidal ideation is present.' },
            { label: 'C', explanation: 'Standardized assessments are useful for treatment planning but do not replace a direct suicide risk assessment.' },
            { label: 'D', explanation: 'Treatment planning should occur after the safety assessment is complete and risk level is determined.' },
          ],
        },
        {
          questionText: 'Which cultural consideration is MOST important in your initial work with Maria?',
          competencyArea: 'Cultural Competence',
          choices: [
            { label: 'A', text: 'Assume her Latina identity means family is her primary concern' },
            { label: 'B', text: 'Explore Maria\'s own understanding of her distress and what help-seeking means in her cultural context' },
            { label: 'C', text: 'Immediately offer to include family members in treatment' },
            { label: 'D', text: 'Use a Spanish-language version of all intake forms' },
          ],
          correctAnswer: 'B',
          rationale: 'Cultural humility involves exploring the client\'s own perspective rather than applying stereotypes. Understanding Maria\'s explanatory model of her distress and her cultural attitudes toward mental health treatment is foundational.',
          incorrectRationales: [
            { label: 'A', explanation: 'Making assumptions based on ethnic identity is stereotyping, not cultural competence.' },
            { label: 'C', explanation: 'Family involvement may be appropriate but should be discussed with Maria first based on her preferences.' },
            { label: 'D', explanation: 'Language accommodation may be needed, but her language preference should be assessed, not assumed.' },
          ],
        },
        {
          questionText: 'If Maria\'s suicidal ideation escalates to include a plan during session, what is your legal and ethical obligation under California law?',
          competencyArea: 'Ethics & Legal',
          choices: [
            { label: 'A', text: 'Document the disclosure and monitor at the next session' },
            { label: 'B', text: 'Contact her husband to inform him of her suicidal plan' },
            { label: 'C', text: 'Develop a safety plan with Maria and determine if a higher level of care is needed, breaking confidentiality only as necessary to protect her life' },
            { label: 'D', text: 'Immediately call 911 regardless of Maria\'s wishes' },
          ],
          correctAnswer: 'C',
          rationale: 'When suicidal ideation escalates to include a plan, the clinician must balance the duty to protect with the least restrictive intervention. Collaborative safety planning is the standard of care, with confidentiality breaches limited to what is necessary to prevent harm.',
          incorrectRationales: [
            { label: 'A', explanation: 'Waiting until the next session when a client has a suicidal plan is clinically and legally negligent.' },
            { label: 'B', explanation: 'Notifying family may be part of a safety plan, but it requires clinical judgment and is not automatically required.' },
            { label: 'D', explanation: 'Calling 911 may be appropriate in some cases but is not automatically the first step. Clinical assessment of the plan\'s lethality and imminence guides the response.' },
          ],
        },
      ],
    },
    {
      id: 'vignette-seed-2',
      clientPresentation: 'James, a 17-year-old African American male, is brought to your office by his mother. He sits with arms crossed, minimal verbal responses, and appears irritable. His mother reports he was suspended from school for fighting and his grades have dropped significantly over the past semester.',
      demographics: '17-year-old African American male, high school junior, lives with mother',
      presentingProblem: 'School behavioral problems, declining academics, irritability, fighting',
      relevantHistory: 'James\'s father was incarcerated 6 months ago. He was previously an honor student and athlete. His mother works two jobs. James has started spending time with a new peer group. He denies substance use but his mother suspects marijuana. No prior mental health treatment.',
      questions: [
        {
          questionText: 'What diagnostic considerations should you prioritize during your initial assessment?',
          competencyArea: 'Diagnosis',
          choices: [
            { label: 'A', text: 'Conduct Disorder given the fighting and behavioral changes' },
            { label: 'B', text: 'Adjustment Disorder and possible depression, given the recent family disruption and behavior change' },
            { label: 'C', text: 'Oppositional Defiant Disorder based on his irritability and resistance in session' },
            { label: 'D', text: 'ADHD since his grades have dropped' },
          ],
          correctAnswer: 'B',
          rationale: 'James\'s behavioral changes are temporally linked to his father\'s incarceration — a significant psychosocial stressor. An Adjustment Disorder or depressive episode better explains the marked shift from prior high functioning. Irritability is a key depression symptom in adolescents.',
          incorrectRationales: [
            { label: 'A', explanation: 'Conduct Disorder requires a persistent pattern, and these behaviors are recent with a clear precipitant. This risks pathologizing grief.' },
            { label: 'C', explanation: 'ODD requires at least 6 months of symptoms and James\'s behavior appears reactive to trauma, not characterological.' },
            { label: 'D', explanation: 'ADHD does not typically present as a sudden change in academic performance linked to a life event.' },
          ],
        },
        {
          questionText: 'James refuses to speak during session. What is the MOST clinically appropriate approach?',
          competencyArea: 'Treatment Planning',
          choices: [
            { label: 'A', text: 'Require verbal participation as a condition of treatment' },
            { label: 'B', text: 'Meet with his mother alone to gather information since James is uncooperative' },
            { label: 'C', text: 'Acknowledge his resistance non-judgmentally and use engagement strategies appropriate for adolescents' },
            { label: 'D', text: 'Refer him to a male therapist who might build better rapport' },
          ],
          correctAnswer: 'C',
          rationale: 'Adolescent resistance is normative, especially when mandated to attend. Non-judgmental acknowledgment, motivational approaches, and meeting the client where they are is the evidence-based approach to building therapeutic alliance with resistant adolescents.',
          incorrectRationales: [
            { label: 'A', explanation: 'Demanding participation creates a power struggle and mirrors the authoritarian dynamics that may be contributing to his distress.' },
            { label: 'B', explanation: 'While collateral information is useful, meeting alone with the parent before establishing trust with the adolescent can damage the therapeutic relationship.' },
            { label: 'D', explanation: 'Premature referral based on assumptions about rapport avoids the clinician\'s responsibility to develop culturally responsive engagement skills.' },
          ],
        },
      ],
    },
    {
      id: 'vignette-seed-3',
      clientPresentation: 'Dr. Chen, a 52-year-old physician, presents voluntarily seeking help for "burnout." She appears well-groomed but displays flat affect. She reports working 70-hour weeks, frequent headaches, and has been prescribing herself benzodiazepines for sleep for the past 4 months.',
      demographics: '52-year-old Asian American female, physician, divorced, one adult child',
      presentingProblem: 'Burnout symptoms, self-prescribing benzodiazepines, sleep disturbance',
      relevantHistory: 'Divorced 18 months ago. Reports her medical practice is her "identity." Has been increasingly isolated from friends. No prior psychiatric history. Drinks 2-3 glasses of wine nightly "to unwind." Reports no suicidal ideation but states "I don\'t see the point of anything anymore."',
      questions: [
        {
          questionText: 'Which clinical issue requires the MOST immediate attention?',
          competencyArea: 'Risk Assessment',
          choices: [
            { label: 'A', text: 'The burnout symptoms and work-life balance' },
            { label: 'B', text: 'The self-prescribing behavior and concurrent alcohol use, which together suggest substance misuse' },
            { label: 'C', text: 'The divorce adjustment and identity concerns' },
            { label: 'D', text: 'The flat affect and possible depressive episode' },
          ],
          correctAnswer: 'B',
          rationale: 'Self-prescribing benzodiazepines is both a professional ethics issue and a clinical safety concern, especially combined with nightly alcohol use. Benzodiazepine-alcohol combination carries serious risks including respiratory depression. This requires immediate clinical attention.',
          incorrectRationales: [
            { label: 'A', explanation: 'Burnout is important contextually but is less immediately dangerous than substance misuse.' },
            { label: 'C', explanation: 'Divorce adjustment is relevant but not the most urgent clinical concern given the substance picture.' },
            { label: 'D', explanation: 'Depression assessment is important but the substance use must be addressed first as it affects both safety and diagnostic clarity.' },
          ],
        },
        {
          questionText: 'Regarding the self-prescribing, what are your ethical obligations?',
          competencyArea: 'Ethics & Legal',
          choices: [
            { label: 'A', text: 'This is outside your scope — she is a physician and can manage her own medications' },
            { label: 'B', text: 'Report her immediately to the Medical Board of California' },
            { label: 'C', text: 'Address the clinical and ethical dimensions therapeutically while considering whether a report to the Medical Board is warranted based on patient safety concerns' },
            { label: 'D', text: 'Focus only on the therapeutic relationship and avoid the prescribing issue' },
          ],
          correctAnswer: 'C',
          rationale: 'Self-prescribing controlled substances raises both clinical and professional ethics concerns. The therapist should address this therapeutically and evaluate whether the physician\'s impairment may pose a risk to her patients, which could trigger a duty to report.',
          incorrectRationales: [
            { label: 'A', explanation: 'Self-prescribing controlled substances is considered impaired practice, not standard medical self-care.' },
            { label: 'B', explanation: 'Immediate reporting without clinical assessment is premature. The clinician should first evaluate the situation clinically.' },
            { label: 'D', explanation: 'Ignoring a significant safety and ethics issue to preserve rapport is clinically inappropriate.' },
          ],
        },
      ],
    },
  ];
}
