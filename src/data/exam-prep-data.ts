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

// ─── Official Exam Domain Categories ─────────────────────────────────

// LPCC — NCMHCE (6 domains)
const lpccDomains: TopicCategory[] = [
  {
    id: 'lpcc_ethics',
    name: 'Professional Practice & Ethics (15%)',
    topics: [
      'Ethical decision-making models',
      'Informed consent & confidentiality',
      'Scope of practice & referral',
      'Professional boundaries & dual relationships',
      'Supervision & consultation standards',
      'Cultural competence in ethical practice',
    ],
  },
  {
    id: 'lpcc_assessment',
    name: 'Intake, Assessment & Diagnosis (25%)',
    topics: [
      'Clinical interview & mental status exam',
      'DSM-5-TR diagnostic criteria',
      'Risk assessment & suicide screening',
      'Biopsychosocial assessment',
      'Differential diagnosis',
      'Cultural considerations in assessment',
      'Psychological testing & measurement',
      'Co-occurring disorder identification',
    ],
  },
  {
    id: 'lpcc_treatment_planning',
    name: 'Treatment Planning (15%)',
    topics: [
      'Evidence-based treatment selection',
      'Measurable goals & objectives',
      'Client strengths & resources',
      'Level of care decisions',
      'Collaborative treatment planning',
      'Treatment plan review & modification',
    ],
  },
  {
    id: 'lpcc_interventions',
    name: 'Counseling Skills & Interventions (30%)',
    topics: [
      'CBT techniques & applications',
      'DBT skills & applications',
      'Solution-focused brief therapy',
      'Motivational interviewing',
      'Person-centered & humanistic approaches',
      'Trauma-informed interventions',
      'Crisis intervention & safety planning',
      'Group counseling techniques',
    ],
  },
  {
    id: 'lpcc_attributes',
    name: 'Core Counseling Attributes (15%)',
    topics: [
      'Therapeutic alliance & rapport building',
      'Empathy, genuineness & unconditional positive regard',
      'Self-awareness & self-care',
      'Multicultural counseling competence',
      'Counselor impairment & burnout prevention',
    ],
  },
  {
    id: 'lpcc_clinical_focus',
    name: 'Areas of Clinical Focus (cross-cutting)',
    topics: [
      'Substance use & addictive disorders',
      'Child & adolescent counseling',
      'Couples & family counseling',
      'Career & life transitions',
      'Older adult considerations',
      'LGBTQ+ affirming practices',
    ],
  },
];

// LMFT — AMFTRB National Exam (6 domains)
const lmftDomains: TopicCategory[] = [
  {
    id: 'lmft_systemic',
    name: 'The Practice of Systemic Therapy (23%)',
    topics: [
      'Systems theory & circular causality',
      'Structural family therapy',
      'Strategic & solution-focused approaches',
      'Bowenian family systems theory',
      'Emotionally focused therapy (EFT)',
      'Narrative & collaborative therapies',
      'Gottman method & couples work',
    ],
  },
  {
    id: 'lmft_assessment',
    name: 'Assessing, Hypothesizing & Diagnosing (14%)',
    topics: [
      'Relational & systemic assessment',
      'Genograms & family mapping',
      'DSM-5-TR from a relational perspective',
      'Risk assessment in family systems',
      'Cultural factors in systemic assessment',
      'Intergenerational patterns',
    ],
  },
  {
    id: 'lmft_treatment',
    name: 'Designing & Conducting Treatment (12%)',
    topics: [
      'Systemic treatment planning',
      'Matching interventions to family structure',
      'Working with subsystems',
      'Managing family-of-origin issues',
      'Integrating individual & relational work',
    ],
  },
  {
    id: 'lmft_process',
    name: 'Evaluating Ongoing Process & Terminating Treatment (18%)',
    topics: [
      'Monitoring therapeutic progress',
      'Adjusting treatment based on feedback',
      'Relapse prevention in family systems',
      'Criteria for termination',
      'Managing premature termination',
      'Follow-up & maintenance planning',
    ],
  },
  {
    id: 'lmft_crisis',
    name: 'Managing Crisis Situations (14%)',
    topics: [
      'Domestic violence assessment & safety planning',
      'Suicidality in relational contexts',
      'Child & elder abuse in families',
      'Substance abuse in family systems',
      'Crisis intervention with couples & families',
      'Mandated reporting obligations',
    ],
  },
  {
    id: 'lmft_ethics',
    name: 'Maintaining Ethical, Legal & Professional Standards (19%)',
    topics: [
      'Confidentiality with multiple clients',
      'Duty to warn & protect',
      'Boundaries in couples & family therapy',
      'Informed consent for systemic therapy',
      'Record keeping & documentation',
      'Supervision & professional development',
      'Telehealth ethics & regulations',
    ],
  },
];

// LCSW — ASWB Clinical Exam (4 domains)
const lcswDomains: TopicCategory[] = [
  {
    id: 'lcsw_human_dev',
    name: 'Human Development, Diversity & Behavior in the Environment (24%)',
    topics: [
      'Human growth & development across the lifespan',
      'Systems theory & ecological perspective',
      'Cultural humility & intersectionality',
      'Impact of trauma on development',
      'Family dynamics & family life cycle',
      'Effects of discrimination & oppression',
      'Human behavior in the social environment',
    ],
  },
  {
    id: 'lcsw_assessment',
    name: 'Assessment, Diagnosis & Treatment Planning (30%)',
    topics: [
      'Biopsychosocial assessment',
      'DSM-5-TR diagnostic criteria',
      'Risk & safety assessment',
      'Differential diagnosis',
      'Strengths-based assessment',
      'Evidence-based treatment planning',
      'Cultural considerations in diagnosis',
      'Co-occurring disorders',
    ],
  },
  {
    id: 'lcsw_interventions',
    name: 'Psychotherapy, Clinical Interventions & Case Management (27%)',
    topics: [
      'CBT & cognitive restructuring',
      'Trauma-informed care & EMDR',
      'Motivational interviewing',
      'Crisis intervention & safety planning',
      'Group therapy facilitation',
      'Case management & care coordination',
      'Psychodynamic & psychoanalytic approaches',
    ],
  },
  {
    id: 'lcsw_ethics',
    name: 'Professional Values & Ethics (19%)',
    topics: [
      'NASW Code of Ethics',
      'Confidentiality & informed consent',
      'Duty to warn & mandatory reporting',
      'Professional boundaries & dual relationships',
      'Social justice & advocacy',
      'Supervision & professional development',
    ],
  },
];

// LAW_ETHICS — California-Specific (reorganized under exam-relevant headings)
const lawEthicsDomains: TopicCategory[] = [
  {
    id: 'le_confidentiality',
    name: 'Confidentiality & Privilege',
    topics: [
      'Psychotherapist-patient privilege',
      'Exceptions to confidentiality',
      'Duty to protect (Tarasoff)',
      'Minor consent & confidentiality',
      'HIPAA & state law interaction',
      'Confidentiality in group & couples therapy',
    ],
  },
  {
    id: 'le_mandated',
    name: 'Mandated Reporting',
    topics: [
      'Child abuse reporting (CANRA)',
      'Elder & dependent adult abuse reporting',
      'Reasonable suspicion standard',
      'Reporting procedures & timelines',
      'Immunity & failure-to-report consequences',
    ],
  },
  {
    id: 'le_practice',
    name: 'Professional Practice & Licensing',
    topics: [
      'BBS structure & functions',
      'Scope of practice by license type',
      'Associate registration & supervision requirements',
      'Continuing education requirements',
      'License renewal & disciplinary actions',
      'Title protection & advertising rules',
      'Fee disclosure requirements',
    ],
  },
  {
    id: 'le_boundaries',
    name: 'Boundaries & Professional Conduct',
    topics: [
      'Dual & multiple relationships',
      'Sexual misconduct prohibitions',
      'Informed consent requirements',
      'Documentation & record keeping',
      'Termination & abandonment issues',
    ],
  },
  {
    id: 'le_special',
    name: 'Special Topics in California Law',
    topics: [
      'Telehealth regulations & interstate practice',
      'Business & Professions Code key sections',
      'Board complaint & hearing process',
      'Suicide prevention training requirements',
      'Minors\' rights to treatment',
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
    categories: lpccDomains,
  },
  LMFT: {
    id: 'LMFT',
    title: 'Licensed Marriage & Family Therapist',
    shortTitle: 'LMFT Exam Prep',
    description:
      'Prepare for the AMFTRB National Exam and California MFT licensing examinations.',
    icon: 'Users',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    categories: lmftDomains,
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
    categories: lcswDomains,
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
    categories: lawEthicsDomains,
  },
};

export const STUDY_FORMAT_OPTIONS: { id: StudyFormat; label: string; description: string; icon: string }[] = [
  { id: 'practice_questions', label: 'Practice Questions', description: 'Multiple-choice questions with rationales', icon: 'HelpCircle' },
  { id: 'clinical_vignette', label: 'Clinical Vignettes', description: 'Exam-style case studies testing multiple competencies', icon: 'ClipboardList' },
  { id: 'flashcards', label: 'Flashcards', description: 'Quick-review front/back cards', icon: 'Layers' },
  { id: 'study_guide', label: 'Study Guide', description: 'Comprehensive topic overview', icon: 'BookOpen' },
  { id: 'quick_reference', label: 'Quick Reference', description: 'At-a-glance key facts and exam tips', icon: 'ClipboardList' },
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
      {
        id: 'seed-lmft-2',
        stem: 'A couple presents for therapy after the wife discovered her husband\'s infidelity. In the first session, the wife becomes increasingly agitated and demands the therapist "tell him what he did was wrong." Using Gottman Method Couples Therapy, the therapist\'s BEST initial response is to:',
        choices: [
          { label: 'A', text: 'Validate the wife\'s pain and shift to a structured assessment of the relationship using the Gottman Sound Relationship House framework' },
          { label: 'B', text: 'Immediately establish ground rules prohibiting emotional outbursts' },
          { label: 'C', text: 'Agree with the wife to build therapeutic alliance' },
          { label: 'D', text: 'See each partner individually to avoid escalation' },
        ],
        correctAnswer: 'A',
        rationale: 'The Gottman Method emphasizes validating emotions while providing clinical structure. The Sound Relationship House framework gives the therapist a systematic way to assess the couple\'s strengths and areas of concern without taking sides or shutting down emotional expression.',
        incorrectRationales: [
          { label: 'B', explanation: 'Suppressing emotional expression in the aftermath of betrayal invalidates the injured partner\'s experience and may damage the alliance.' },
          { label: 'C', explanation: 'Taking sides violates therapeutic neutrality and makes conjoint work impossible. The therapist validates feelings, not positions.' },
          { label: 'D', explanation: 'Splitting sessions immediately avoids the clinical work of managing affect in-session, which is a core couples therapy competency.' },
        ],
        topic: 'Gottman method & couples work',
        difficulty: 'exam_level',
      },
      {
        id: 'seed-lmft-3',
        stem: 'According to Bowen Family Systems Theory, a client who consistently avoids conflict by emotionally withdrawing from family interactions is demonstrating which concept?',
        choices: [
          { label: 'A', text: 'Emotional cutoff' },
          { label: 'B', text: 'Differentiation of self' },
          { label: 'C', text: 'Fusion' },
          { label: 'D', text: 'Nuclear family emotional process' },
        ],
        correctAnswer: 'A',
        rationale: 'Emotional cutoff describes the process by which individuals manage unresolved emotional issues with family by reducing or completely severing emotional contact. Withdrawal from conflict is the hallmark behavioral pattern of emotional cutoff.',
        incorrectRationales: [
          { label: 'B', explanation: 'High differentiation involves managing anxiety while maintaining emotional connection — the opposite of withdrawal.' },
          { label: 'C', explanation: 'Fusion involves emotional over-involvement, not withdrawal. Fused individuals are reactive and enmeshed, not avoidant.' },
          { label: 'D', explanation: 'Nuclear family emotional process describes patterns in a nuclear family (triangulation, conflict, cutoff, projection), but the specific pattern described here is cutoff.' },
        ],
        topic: 'Bowenian family systems theory',
        difficulty: 'exam_level',
      },
      {
        id: 'seed-lmft-4',
        stem: 'During an EFT (Emotionally Focused Therapy) session, the therapist helps a withdrawing partner express the vulnerable emotions beneath their defensive pattern. This intervention is occurring in which stage of EFT?',
        choices: [
          { label: 'A', text: 'Stage 1: De-escalation of negative cycle' },
          { label: 'B', text: 'Stage 2: Restructuring interactional positions' },
          { label: 'C', text: 'Stage 3: Consolidation and integration' },
          { label: 'D', text: 'This is not an EFT intervention' },
        ],
        correctAnswer: 'B',
        rationale: 'Stage 2 of EFT focuses on helping partners access and express underlying attachment emotions and needs. Helping a withdrawer access vulnerability beneath their defensive stance is the core change event that restructures the interactional cycle.',
        incorrectRationales: [
          { label: 'A', explanation: 'Stage 1 focuses on identifying and de-escalating the negative interactional cycle. Deeper emotional processing occurs in Stage 2.' },
          { label: 'C', explanation: 'Stage 3 focuses on consolidating gains and integrating new patterns into daily life, not accessing new emotional experience.' },
          { label: 'D', explanation: 'Accessing underlying vulnerable emotions is a hallmark EFT intervention, central to the model\'s theory of change.' },
        ],
        topic: 'Emotionally focused therapy (EFT)',
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
        topic: 'Systems theory & ecological perspective',
        difficulty: 'intermediate',
      },
      {
        id: 'seed-lcsw-2',
        stem: 'A clinical social worker is treating a client who reports severe domestic violence. The client\'s partner has threatened to kill her if she leaves. According to the NASW Code of Ethics and California law, the social worker\'s PRIMARY obligation is to:',
        choices: [
          { label: 'A', text: 'Respect the client\'s right to self-determination and support whatever decision she makes' },
          { label: 'B', text: 'Prioritize the client\'s safety by conducting a danger assessment and developing a safety plan, while supporting her autonomy within that framework' },
          { label: 'C', text: 'Report the domestic violence to law enforcement immediately' },
          { label: 'D', text: 'Contact the partner to de-escalate the situation' },
        ],
        correctAnswer: 'B',
        rationale: 'The NASW Code of Ethics recognizes that self-determination may be limited when there is a serious, foreseeable, and imminent risk to self or others. Safety planning balances the duty to protect with respect for the client\'s autonomy and agency.',
        incorrectRationales: [
          { label: 'A', explanation: 'Unrestricted self-determination does not apply when there is imminent danger to the client\'s life. The social worker must address safety.' },
          { label: 'C', explanation: 'California does not mandate reporting domestic violence against adults unless the injury requires medical attention. Reporting without the client\'s consent may increase danger.' },
          { label: 'D', explanation: 'Contacting the abusive partner could escalate the danger and violates the client\'s confidentiality.' },
        ],
        topic: 'NASW Code of Ethics',
        difficulty: 'exam_level',
      },
      {
        id: 'seed-lcsw-3',
        stem: 'A client presents with symptoms of both PTSD and Borderline Personality Disorder. According to current evidence-based practice, which treatment approach is MOST appropriate?',
        choices: [
          { label: 'A', text: 'Treat the BPD first and address PTSD only after emotional regulation is stable' },
          { label: 'B', text: 'Use an integrated approach such as DBT-PE (Dialectical Behavior Therapy with Prolonged Exposure) that addresses both conditions concurrently' },
          { label: 'C', text: 'Focus exclusively on PTSD since BPD symptoms are likely trauma-driven' },
          { label: 'D', text: 'Refer to separate specialists for each condition' },
        ],
        correctAnswer: 'B',
        rationale: 'Current evidence supports integrated treatment approaches like DBT-PE for co-occurring BPD and PTSD. Research shows that treating both simultaneously is more effective than sequential treatment and does not increase risk of self-harm or dropout.',
        incorrectRationales: [
          { label: 'A', explanation: 'The sequential approach (stabilize then process trauma) has been challenged by research showing integrated treatment is safe and more effective.' },
          { label: 'C', explanation: 'While PTSD and BPD overlap, BPD involves distinct patterns (interpersonal instability, identity disturbance) that require targeted intervention.' },
          { label: 'D', explanation: 'Split treatment for co-occurring conditions fragments care and reduces treatment coherence.' },
        ],
        topic: 'Evidence-based treatment planning',
        difficulty: 'exam_level',
      },
      {
        id: 'seed-lcsw-4',
        stem: 'When conducting a biopsychosocial assessment, a social worker should ALWAYS consider which factor that distinguishes the social work perspective from other clinical disciplines?',
        choices: [
          { label: 'A', text: 'Diagnostic criteria from the DSM-5-TR' },
          { label: 'B', text: 'The person-in-environment (PIE) perspective, including systemic oppression and social determinants of health' },
          { label: 'C', text: 'Psychopharmacological treatment options' },
          { label: 'D', text: 'Cognitive distortions and automatic thoughts' },
        ],
        correctAnswer: 'B',
        rationale: 'The PIE perspective is foundational to social work practice and distinguishes it from other mental health disciplines. It requires assessing how environmental factors — poverty, discrimination, housing instability, community resources — interact with individual functioning.',
        incorrectRationales: [
          { label: 'A', explanation: 'DSM-5-TR diagnosis is used across disciplines. It does not uniquely represent the social work perspective.' },
          { label: 'C', explanation: 'Psychopharmacology is primarily within the medical/psychiatric domain, not distinctly social work.' },
          { label: 'D', explanation: 'Cognitive distortions are a CBT concept applicable across disciplines, not uniquely social work.' },
        ],
        topic: 'Biopsychosocial assessment',
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
      clientPresentation: 'Maria, a 34-year-old Latina woman, presents to your outpatient office appearing tearful and fatigued. She speaks softly and avoids eye contact. She reports she has not been sleeping well for the past two months and has lost interest in activities she previously enjoyed, including spending time with her two children, ages 6 and 9. She recently experienced the death of her mother, who was her primary support system. Her husband works long hours and she reports feeling isolated. She denies substance use. No prior suicide attempts but reports passive suicidal ideation ("sometimes I think my family would be better off without me").',
      demographics: '34-year-old Latina female, married, two children',
      presentingProblem: 'Persistent sadness, insomnia, anhedonia, social withdrawal over 2 months',
      relevantHistory: 'Death of mother (primary support) 2 months ago. No prior mental health treatment. Husband works long hours. Reports isolation. Denies substance use. Passive suicidal ideation present.',
      questions: [],
      igPhase: {
        prompt: 'Based on the client presentation, which of the following clinical actions would you take during the initial session? Select all that apply.',
        actions: [
          { id: 'ig-1a', text: 'Conduct a thorough suicide risk assessment including plan, intent, means, and protective factors', rating: 'most_productive', rationale: 'Passive suicidal ideation requires immediate, structured risk assessment. This is the highest priority given her statement about her family being better off without her.' },
          { id: 'ig-1b', text: 'Explore Maria\'s own understanding of her distress and what help-seeking means in her cultural context', rating: 'most_productive', rationale: 'Cultural humility is essential. Understanding her explanatory model of distress and attitudes toward mental health treatment will inform all subsequent clinical decisions.' },
          { id: 'ig-1c', text: 'Assess current functioning: sleep patterns, appetite, daily routine, childcare capacity', rating: 'most_productive', rationale: 'Functional assessment establishes baseline severity and identifies immediate concerns such as whether the children are receiving adequate care.' },
          { id: 'ig-1d', text: 'Administer the PHQ-9 to establish a baseline depression score', rating: 'productive', rationale: 'Standardized measures support diagnostic clarity and treatment planning, though they supplement rather than replace clinical interview.' },
          { id: 'ig-1e', text: 'Explore the grief process and her relationship with her mother', rating: 'productive', rationale: 'Understanding the attachment bond and grief trajectory is clinically relevant but secondary to safety assessment in this session.' },
          { id: 'ig-1f', text: 'Ask about social support network beyond her husband', rating: 'productive', rationale: 'Identifying available support is relevant for safety planning and treatment, though not the immediate priority.' },
          { id: 'ig-1g', text: 'Inquire about her children\'s adjustment to the grandmother\'s death', rating: 'productive', rationale: 'Relevant for understanding the family system, but the focus should be on Maria\'s clinical presentation first.' },
          { id: 'ig-1h', text: 'Immediately contact her husband to discuss her suicidal ideation', rating: 'counterproductive', rationale: 'Breaching confidentiality without completing a risk assessment and discussing it with Maria first violates ethical standards and damages the therapeutic alliance.' },
          { id: 'ig-1i', text: 'Recommend she begin an SSRI medication immediately', rating: 'counterproductive', rationale: 'As a counselor, prescribing is outside your scope of practice. A psychiatric referral may be appropriate after assessment, but recommending specific medication is inappropriate.' },
          { id: 'ig-1j', text: 'Suggest she take a vacation to help with her mood', rating: 'unproductive', rationale: 'Lifestyle suggestions without clinical assessment minimize the severity of her presentation and do not address the suicidal ideation.' },
          { id: 'ig-1k', text: 'Focus the session on building rapport through casual conversation', rating: 'unproductive', rationale: 'While rapport is important, avoiding clinical assessment when suicidal ideation has been disclosed is negligent.' },
        ],
      },
      dmPhase: {
        prompt: 'Based on your assessment of Maria, address the following clinical decision points.',
        decisionPoints: [
          {
            id: 'dm-1a',
            questionText: 'After completing your risk assessment, Maria denies a specific plan or intent but continues to express passive ideation. What is your most appropriate next step?',
            competencyArea: 'Risk Assessment',
            choices: [
              { label: 'A', text: 'Develop a collaborative safety plan including coping strategies, emergency contacts, and crisis resources' },
              { label: 'B', text: 'Initiate involuntary hospitalization under the LPS Act' },
              { label: 'C', text: 'Document the ideation and schedule a follow-up in one month' },
              { label: 'D', text: 'Discontinue assessment since she denied a plan' },
            ],
            correctAnswer: 'A',
            rationale: 'Passive ideation without plan or intent warrants a collaborative safety plan as the standard of care. This is the least restrictive appropriate intervention that addresses safety while maintaining the therapeutic alliance.',
            incorrectRationales: [
              { label: 'B', explanation: 'Involuntary hold requires imminent danger. Passive ideation without plan or intent does not meet the LPS threshold.' },
              { label: 'C', explanation: 'One month is too long between sessions when suicidal ideation is present. More frequent contact is clinically indicated.' },
              { label: 'D', explanation: 'Passive ideation still requires ongoing monitoring and safety planning. Absence of a plan does not eliminate risk.' },
            ],
          },
          {
            id: 'dm-1b',
            questionText: 'What is the MOST appropriate initial diagnostic conceptualization for Maria?',
            competencyArea: 'Diagnosis',
            choices: [
              { label: 'A', text: 'Major Depressive Disorder, single episode, moderate, with anxious distress' },
              { label: 'B', text: 'Persistent Depressive Disorder (Dysthymia)' },
              { label: 'C', text: 'Adjustment Disorder with Depressed Mood' },
              { label: 'D', text: 'Prolonged Grief Disorder' },
            ],
            correctAnswer: 'A',
            rationale: 'Maria presents with depressed mood, anhedonia, insomnia, fatigue, and suicidal ideation lasting 2 months — meeting criteria for MDD. While grief-related, her symptoms exceed normal bereavement and include suicidal ideation, warranting an MDD diagnosis.',
            incorrectRationales: [
              { label: 'B', explanation: 'Dysthymia requires at least 2 years of symptoms. Maria\'s presentation is 2 months duration.' },
              { label: 'C', explanation: 'Adjustment Disorder is a less severe diagnosis that does not fully capture the suicidal ideation and functional impairment described.' },
              { label: 'D', explanation: 'Prolonged Grief Disorder requires 12 months in adults. At 2 months, this diagnosis is premature.' },
            ],
          },
          {
            id: 'dm-1c',
            questionText: 'Which treatment approach is MOST appropriate to recommend for Maria\'s initial treatment plan?',
            competencyArea: 'Treatment Planning',
            choices: [
              { label: 'A', text: 'CBT for depression with behavioral activation, integrated with grief-focused interventions and culturally responsive adaptations' },
              { label: 'B', text: 'Psychodynamic therapy focusing on early attachment relationships' },
              { label: 'C', text: 'EMDR for traumatic grief processing' },
              { label: 'D', text: 'Group therapy for bereavement' },
            ],
            correctAnswer: 'A',
            rationale: 'CBT with behavioral activation is evidence-based for depression and can be integrated with grief-focused work. Cultural adaptation ensures the treatment respects Maria\'s values and context. This addresses both the depression and the grief precipitant.',
            incorrectRationales: [
              { label: 'B', explanation: 'While attachment is relevant, psychodynamic therapy is not the first-line evidence-based treatment for acute depression with suicidal ideation.' },
              { label: 'C', explanation: 'EMDR is primarily indicated for PTSD. While grief can involve trauma, her presentation is primarily depressive rather than traumatic.' },
              { label: 'D', explanation: 'Group therapy may be beneficial later, but individual treatment should be established first given the suicidal ideation and severity of symptoms.' },
            ],
          },
        ],
      },
    },
    {
      id: 'vignette-seed-2',
      clientPresentation: 'James, a 17-year-old African American male, is brought to your office by his mother. He sits with arms crossed, minimal verbal responses, and appears irritable. His mother reports he was suspended from school for fighting and his grades have dropped significantly over the past semester. James\'s father was incarcerated 6 months ago. He was previously an honor student and athlete.',
      demographics: '17-year-old African American male, high school junior, lives with mother',
      presentingProblem: 'School behavioral problems, declining academics, irritability, fighting',
      relevantHistory: 'Father incarcerated 6 months ago. Previously honor student and athlete. Mother works two jobs. New peer group. Denies substance use but mother suspects marijuana. No prior mental health treatment.',
      questions: [],
      igPhase: {
        prompt: 'Given James\'s presentation and his mother\'s report, which clinical actions would you take? Select all that apply.',
        actions: [
          { id: 'ig-2a', text: 'Meet with James individually first to build rapport before involving his mother', rating: 'most_productive', rationale: 'Adolescents need to feel the therapist is their ally, not an extension of parental authority. Individual time first builds trust.' },
          { id: 'ig-2b', text: 'Assess for depressive symptoms, recognizing that irritability is a key depression marker in adolescents', rating: 'most_productive', rationale: 'Behavioral changes linked to a major stressor suggest depression. Irritability is the hallmark adolescent depression presentation per DSM-5-TR.' },
          { id: 'ig-2c', text: 'Screen for substance use using an age-appropriate validated tool (e.g., CRAFFT)', rating: 'most_productive', rationale: 'Mother\'s suspicion of marijuana use warrants formal screening. Substance use could be contributing to behavioral changes and complicates diagnosis.' },
          { id: 'ig-2d', text: 'Explore his experience of his father\'s incarceration and its impact on his identity', rating: 'productive', rationale: 'The father\'s incarceration is the likely precipitant. Understanding James\'s experience is clinically important, though timing should follow rapport building.' },
          { id: 'ig-2e', text: 'Assess school functioning and peer relationships in detail', rating: 'productive', rationale: 'Understanding the context of behavioral changes at school helps differentiate situational from pervasive problems.' },
          { id: 'ig-2f', text: 'Conduct a suicide risk screening given the behavioral changes and recent loss', rating: 'productive', rationale: 'Parental incarceration is an adverse childhood experience (ACE) associated with elevated suicide risk. Screening is warranted.' },
          { id: 'ig-2g', text: 'Immediately diagnose Conduct Disorder based on the fighting', rating: 'counterproductive', rationale: 'Premature diagnosis based on limited behavioral data pathologizes grief. Recent-onset behavior linked to a clear stressor does not meet CD criteria.' },
          { id: 'ig-2h', text: 'Tell James his mother is concerned and he needs to cooperate with treatment', rating: 'counterproductive', rationale: 'This positions the therapist as another authority figure and reinforces the power dynamic that may be driving his resistance.' },
          { id: 'ig-2i', text: 'Contact the school counselor for additional behavioral reports', rating: 'unproductive', rationale: 'Collateral contacts are premature in the first session. Building rapport with James should precede gathering information from other systems without his input.' },
          { id: 'ig-2j', text: 'Recommend a psychiatric evaluation for medication', rating: 'unproductive', rationale: 'Medication evaluation may be appropriate later, but recommending it before completing a thorough assessment is premature and may alienate a resistant adolescent.' },
        ],
      },
      dmPhase: {
        prompt: 'Based on your initial assessment of James, address these clinical decisions.',
        decisionPoints: [
          {
            id: 'dm-2a',
            questionText: 'James opens up slightly in the individual session, revealing anger at his father and shame among peers. What diagnostic conceptualization is MOST appropriate?',
            competencyArea: 'Diagnosis',
            choices: [
              { label: 'A', text: 'Adjustment Disorder with Mixed Disturbance of Emotions and Conduct' },
              { label: 'B', text: 'Conduct Disorder, childhood-onset type' },
              { label: 'C', text: 'Oppositional Defiant Disorder' },
              { label: 'D', text: 'Disruptive Mood Dysregulation Disorder' },
            ],
            correctAnswer: 'A',
            rationale: 'James\'s behavioral changes are directly linked to his father\'s incarceration (clear psychosocial stressor) and represent a marked change from prior functioning. The mixed emotional (anger, shame) and behavioral (fighting, grade decline) symptoms fit Adjustment Disorder.',
            incorrectRationales: [
              { label: 'B', explanation: 'CD requires a repetitive, persistent pattern over 12 months. James\'s changes are recent and clearly precipitated by a specific stressor.' },
              { label: 'C', explanation: 'ODD requires 6 months of symptoms. His irritability and defiance are reactive, not characterological.' },
              { label: 'D', explanation: 'DMDD requires chronic, severe irritability present before age 10 and in multiple settings for 12+ months. Does not fit this presentation.' },
            ],
          },
          {
            id: 'dm-2b',
            questionText: 'James\'s CRAFFT screen is positive. He admits to smoking marijuana "a few times a week" since his father left. How should this inform your treatment approach?',
            competencyArea: 'Treatment Planning',
            choices: [
              { label: 'A', text: 'Refer to a substance abuse program and pause counseling until substance use is addressed' },
              { label: 'B', text: 'Integrate substance use into the treatment plan using motivational interviewing while addressing the underlying grief and depression' },
              { label: 'C', text: 'Report the marijuana use to his mother immediately' },
              { label: 'D', text: 'Minimize the marijuana use since it is common among adolescents' },
            ],
            correctAnswer: 'B',
            rationale: 'Co-occurring substance use and depression in adolescents are best treated with an integrated approach. MI respects James\'s autonomy while addressing the substance use as a coping mechanism linked to his grief.',
            incorrectRationales: [
              { label: 'A', explanation: 'Sequential treatment (substance first, then mental health) is outdated. Integrated treatment for co-occurring issues is the evidence-based standard.' },
              { label: 'C', explanation: 'Adolescent confidentiality protections apply unless there is imminent danger. Breaking confidentiality over marijuana use would destroy the therapeutic alliance.' },
              { label: 'D', explanation: 'Normalizing substance use as a coping mechanism for grief fails to address a clinically significant issue that compounds his depression.' },
            ],
          },
          {
            id: 'dm-2c',
            questionText: 'James asks if you will visit his father in prison to "tell him what he did to me." What is your MOST appropriate response?',
            competencyArea: 'Ethics & Legal',
            choices: [
              { label: 'A', text: 'Agree to contact the father to facilitate family healing' },
              { label: 'B', text: 'Validate the underlying need while explaining the boundaries of the therapeutic relationship, and explore what he hopes the message would accomplish' },
              { label: 'C', text: 'Refuse and redirect to other topics' },
              { label: 'D', text: 'Suggest James write a letter to his father instead' },
            ],
            correctAnswer: 'B',
            rationale: 'The request reveals James\'s desire for his father to understand his pain. Validating this while maintaining boundaries is therapeutically sound. Exploring the function of the request opens deeper clinical work.',
            incorrectRationales: [
              { label: 'A', explanation: 'Visiting the father is outside the scope of individual therapy and creates a dual relationship. The clinician is James\'s therapist, not a family mediator.' },
              { label: 'C', explanation: 'Abrupt refusal without validation dismisses an important therapeutic moment and may reinforce James\'s belief that adults don\'t understand.' },
              { label: 'D', explanation: 'Letter-writing may be a useful intervention later, but offering a solution before exploring the underlying need bypasses important clinical material.' },
            ],
          },
        ],
      },
    },
  ];
}
