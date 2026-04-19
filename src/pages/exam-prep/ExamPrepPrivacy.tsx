import LegalPage, { LegalH2, LegalH3, LegalP, LegalUL } from '@/components/exam-prep/LegalPage';

export default function ExamPrepPrivacy() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="April 14, 2026">
      <LegalP>
        EduCare LLC ("EduCare," "we," "us," or "our") operates EduCare Exam Prep Studio (the
        "Service"). This Privacy Policy describes how we collect, use, and share personal
        information when you use the Service and your rights under the California Consumer
        Privacy Act as amended by the California Privacy Rights Act ("CCPA/CPRA").
      </LegalP>

      <LegalH2>1. Information we collect</LegalH2>

      <LegalH3>Account and profile</LegalH3>
      <LegalUL>
        <li>Email address and name (via email/password sign-up or Google OAuth)</li>
        <li>Preferred license type (LMFT, LPCC, LCSW)</li>
        <li>Selected exam tracks and onboarding responses</li>
      </LegalUL>

      <LegalH3>Study and usage data</LegalH3>
      <LegalUL>
        <li>Study plans, saved materials, folders, and tags</li>
        <li>Quiz sessions, answers, scores, and domain-level performance</li>
        <li>Diagnostic assessments and self-assessment responses</li>
        <li>AI generation activity (prompts, topics, counts) for rate limiting and audit purposes</li>
      </LegalUL>

      <LegalH3>Payment information</LegalH3>
      <LegalP>
        We do not store full payment card data. Payment processing is handled by Stripe, Inc. We
        retain a Stripe customer identifier, subscription status, and billing period dates to
        provision access to paid features.
      </LegalP>

      <LegalH3>Technical information</LegalH3>
      <LegalP>
        Standard server and application logs (IP address, browser type, timestamps, error traces)
        collected by our infrastructure providers for security, debugging, and abuse prevention.
      </LegalP>

      <LegalH2>2. How we use information</LegalH2>
      <LegalUL>
        <li>Deliver and personalize the Service (study plans, content generation, progress tracking)</li>
        <li>Authenticate your account and prevent fraud or abuse</li>
        <li>Process subscriptions and billing</li>
        <li>Respond to support requests</li>
        <li>Improve the accuracy and quality of generated content, including through audit review</li>
        <li>Comply with legal obligations</li>
      </LegalUL>

      <LegalH2>3. Service providers we share data with</LegalH2>
      <LegalUL>
        <li><strong>Supabase</strong> — database, authentication, and serverless function hosting</li>
        <li><strong>Google (Gemini API, Google OAuth)</strong> — AI content generation and optional sign-in</li>
        <li><strong>Stripe</strong> — subscription payment processing</li>
        <li><strong>Vercel</strong> — application hosting and delivery</li>
      </LegalUL>
      <LegalP>
        We require each service provider to use personal information only to provide services to
        us. We do not sell or share personal information for cross-context behavioral
        advertising.
      </LegalP>

      <LegalH2>4. AI generation and your content</LegalH2>
      <LegalP>
        When you use content generation features, your prompts and the AI's responses are sent to
        Google's Gemini API under Google's terms for that API and logged in our audit system for
        content quality review. We do not use your prompts to train third-party general models;
        Google's API terms govern Google's handling of the data.
      </LegalP>

      <LegalH2>5. Your CCPA/CPRA rights</LegalH2>
      <LegalP>If you are a California resident, you have the right to:</LegalP>
      <LegalUL>
        <li>Know what personal information we collect and how we use it</li>
        <li>Access a copy of the personal information we hold about you</li>
        <li>Delete personal information we hold about you, subject to limited exceptions</li>
        <li>Correct inaccurate personal information</li>
        <li>Opt out of the sale or sharing of personal information (we do not sell or share)</li>
        <li>Limit the use of sensitive personal information (we do not use sensitive data beyond what is required to provide the Service)</li>
        <li>Not be discriminated against for exercising any of these rights</li>
      </LegalUL>
      <LegalP>
        To exercise these rights, email{' '}
        <a className="text-blue-700 underline hover:text-blue-800" href="mailto:support@educarecomplete.com">
          support@educarecomplete.com
        </a>
        . We will verify your identity and respond within 45 days, or explain any extension as
        permitted by law.
      </LegalP>

      <LegalH2>6. Data retention</LegalH2>
      <LegalP>
        We retain account and study data while your account is active. If you delete your
        account, we delete or anonymize associated personal information within 60 days, except
        where we must retain it to comply with legal, tax, or audit obligations. Stripe billing
        records are retained by Stripe according to their policies.
      </LegalP>

      <LegalH2>7. Security</LegalH2>
      <LegalP>
        We use industry-standard encryption in transit (TLS) and at rest, row-level security
        policies in our database, and least-privilege access controls. No system is perfectly
        secure; we cannot guarantee the security of information you transmit to us.
      </LegalP>

      <LegalH2>8. Children</LegalH2>
      <LegalP>
        The Service is intended for adult professionals and professionals in training. We do not
        knowingly collect personal information from anyone under 18.
      </LegalP>

      <LegalH2>9. Changes to this policy</LegalH2>
      <LegalP>
        We will post changes on this page and update the Effective date above. Material changes
        will be communicated by email or in-app notice.
      </LegalP>

      <LegalH2>10. Contact</LegalH2>
      <LegalP>
        EduCare LLC, Redlands, California. Email:{' '}
        <a className="text-blue-700 underline hover:text-blue-800" href="mailto:support@educarecomplete.com">
          support@educarecomplete.com
        </a>
      </LegalP>
    </LegalPage>
  );
}
