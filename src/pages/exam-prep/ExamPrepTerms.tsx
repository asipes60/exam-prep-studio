import LegalPage, { LegalH2, LegalP, LegalUL } from '@/components/exam-prep/LegalPage';

export default function ExamPrepTerms() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="April 14, 2026">
      <LegalP>
        These Terms of Service ("Terms") govern your use of EduCare Exam Prep Studio (the
        "Service"), operated by EduCare LLC, a California limited liability company ("EduCare,"
        "we," "us," or "our"). By creating an account or using the Service, you agree to these
        Terms.
      </LegalP>

      <LegalH2>1. Eligibility</LegalH2>
      <LegalP>
        You must be at least 18 years old and able to form a binding contract. The Service is
        intended for licensed behavioral health professionals and candidates preparing for
        California mental health licensing exams.
      </LegalP>

      <LegalH2>2. Accounts</LegalH2>
      <LegalP>
        You are responsible for maintaining the confidentiality of your account credentials and
        for all activity under your account. Notify us promptly of any unauthorized use.
      </LegalP>

      <LegalH2>3. Subscriptions and billing</LegalH2>
      <LegalUL>
        <li>
          Paid subscriptions are billed through Stripe in advance on a recurring basis (monthly or
          every six months, depending on the plan selected).
        </li>
        <li>
          Subscriptions automatically renew at the then-current price unless you cancel before the
          end of the current billing period, which you can do through the billing portal.
        </li>
        <li>
          All sales are final and nonrefundable unless required by law. You may cancel any time;
          cancellation takes effect at the end of your paid period.
        </li>
        <li>
          We may change subscription pricing with at least 30 days' notice. Price changes will not
          take effect until your next renewal after the notice period.
        </li>
      </LegalUL>

      <LegalH2>4. AI-generated content</LegalH2>
      <LegalP>
        The Service uses artificial intelligence (currently Google's Gemini 2.0 Flash model) to
        generate practice questions, rationales, flashcards, clinical simulations, and study
        materials. AI-generated content:
      </LegalP>
      <LegalUL>
        <li>May contain errors, outdated references, or omissions;</li>
        <li>Is not legal advice, clinical advice, or a diagnosis;</li>
        <li>Should be verified against primary sources before being relied upon;</li>
        <li>Does not guarantee any exam outcome.</li>
      </LegalUL>

      <LegalH2>5. No affiliation with exam boards</LegalH2>
      <LegalP>
        EduCare Exam Prep Studio is not affiliated with, endorsed by, or sponsored by the
        California Board of Behavioral Sciences (BBS), the National Board for Certified
        Counselors (NBCC), the Association of Social Work Boards (ASWB), CAMFT, NASW, or any
        other licensing board or examination sponsor. All trademarks belong to their respective
        owners.
      </LegalP>

      <LegalH2>6. Acceptable use</LegalH2>
      <LegalP>You agree not to:</LegalP>
      <LegalUL>
        <li>Resell, sublicense, or redistribute the Service or AI-generated content commercially without written permission;</li>
        <li>Circumvent rate limits, access controls, or the subscription model;</li>
        <li>Reverse engineer, scrape at scale, or use automated tools to harvest content;</li>
        <li>Upload unlawful, harmful, or infringing content;</li>
        <li>Misrepresent the Service's output as official exam material or authoritative legal guidance.</li>
      </LegalUL>

      <LegalH2>7. Intellectual property</LegalH2>
      <LegalP>
        The Service, including its interface, curriculum structure, knowledge base, and branding,
        is owned by EduCare LLC and protected by intellectual property laws. You receive a
        limited, revocable, non-exclusive, non-transferable license to use the Service for your
        personal exam preparation.
      </LegalP>
      <LegalP>
        Content you generate for personal study is yours to use for your own non-commercial
        preparation. You grant EduCare a license to store, process, and display that content as
        necessary to provide the Service to you, and to audit and improve content quality.
      </LegalP>

      <LegalH2>8. Termination</LegalH2>
      <LegalP>
        You may delete your account at any time. We may suspend or terminate your access for
        violation of these Terms, fraud, or abuse. Upon termination, your right to use the
        Service ends; Sections 4, 7, 9, 10, 11, and 12 survive.
      </LegalP>

      <LegalH2>9. Disclaimer of warranties</LegalH2>
      <LegalP>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER
        EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
        NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR FREE, OR
        THAT CONTENT IS ACCURATE OR COMPLETE. WE DO NOT GUARANTEE ANY EXAM OUTCOME.
      </LegalP>

      <LegalH2>10. Limitation of liability</LegalH2>
      <LegalP>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, EDUCARE AND ITS OFFICERS, EMPLOYEES, AND
        AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
        INDIRECTLY. OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE
        WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
      </LegalP>

      <LegalH2>11. Indemnification</LegalH2>
      <LegalP>
        You agree to defend and indemnify EduCare against any claim arising from your misuse of
        the Service, your violation of these Terms, or your violation of any law or third-party
        right.
      </LegalP>

      <LegalH2>12. Governing law and disputes</LegalH2>
      <LegalP>
        These Terms are governed by the laws of the State of California, without regard to its
        conflict of laws rules. Any dispute must be brought in the state or federal courts
        located in San Bernardino County, California, and you consent to personal jurisdiction
        there.
      </LegalP>

      <LegalH2>13. Changes</LegalH2>
      <LegalP>
        We may update these Terms from time to time. We will post changes on this page and update
        the Effective date. Material changes will be communicated by email or in-app notice.
        Continued use of the Service after changes take effect constitutes acceptance.
      </LegalP>

      <LegalH2>14. Contact</LegalH2>
      <LegalP>
        EduCare LLC, Redlands, California. Email:{' '}
        <a className="text-blue-700 underline hover:text-blue-800" href="mailto:support@educarecomplete.com">
          support@educarecomplete.com
        </a>
      </LegalP>
    </LegalPage>
  );
}
