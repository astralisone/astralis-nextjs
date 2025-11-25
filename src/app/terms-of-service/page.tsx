// src/app/terms-of-service/page.tsx
import React from 'react';

const TermsOfServicePage: React.FC = () => {
  const companyName = "Astralis One"; // Placeholder - Replace with your actual company name
  const contactEmail = "support@astralisone.com"; // Placeholder - Replace with your actual support contact email
  const effectiveDate = "November 24, 2025"; // Placeholder - Replace with the actual effective date
  const governingLaw = "the laws of the State of Delaware, without regard to its conflict of law principles."; // Placeholder - Replace with your actual governing law
  const arbitrationProvider = "American Arbitration Association (AAA)"; // Placeholder - Replace with your actual arbitration provider

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-astralis-blue">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-6">Effective Date: {effectiveDate}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          Welcome to {companyName}! These Terms of Service ("Terms") govern your access to and use of our website, products, and services (collectively, the "Service").
          By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Eligibility and Accounts</h2>
        <p className="mb-4">
          You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you are at least 18 years old.
        </p>
        <p className="mb-4">
          When you create an account with us, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account login information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Your Responsibilities and Prohibited Conduct</h2>
        <p className="mb-4">
          You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for all content you upload, post, or otherwise transmit through the Service.
        </p>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Use the Service for any illegal or unauthorized purpose.</li>
          <li>Violate any applicable local, state, national, or international law or regulation.</li>
          <li>Infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
          <li>Harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability.</li>
          <li>Submit false or misleading information.</li>
          <li>Upload or transmit viruses or any other type of malicious code.</li>
          <li>Collect or track the personal information of others.</li>
          <li>Spam, phish, pharm, pretext, spider, crawl, or scrape.</li>
          <li>Interfere with or circumvent the security features of the Service.</li>
          <li>Attempt to reverse engineer, decompile, or disassemble any aspect of the Service.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
        <p className="mb-4">
          The Service and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by {companyName}, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>
        <p className="mb-4">
          You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal or internal business use, strictly in accordance with these Terms.
        </p>
        <p className="mb-4">
          By submitting content to the Service, you grant {companyName} a worldwide, non-exclusive, royalty-free, transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the content in connection with the Service and {companyName}'s (and its successors' and affiliates') business, including without limitation for promoting and redistributing part or all of the Service (and derivative works thereof) in any media formats and through any media channels.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Payment Terms (if applicable)</h2>
        <p className="mb-4">
          If you purchase any paid Service, you agree to pay all applicable fees and taxes. We may change our pricing at any time. We will provide you with reasonable prior notice of any change in fees.
        </p>
        <p className="mb-4">
          All payments are processed through third-party payment processors. You agree to comply with their terms and conditions. We are not responsible for any issues arising from your payment transactions with these third parties.
        </p>
        <p className="mb-4">
          Unless otherwise specified, all subscriptions are subject to automatic renewal. You may cancel your subscription at any time, but no refunds will be provided for any unused portion of the subscription term.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Disclaimers and Limitation of Liability</h2>
        <p className="mb-4">
          THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER {companyName} NOR ANY PERSON ASSOCIATED WITH {companyName} MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SERVICE.
        </p>
        <p className="mb-4">
          TO THE FULLEST EXTENT PROVIDED BY LAW, IN NO EVENT WILL {companyName}, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SERVICE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE SERVICE OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Indemnification</h2>
        <p className="mb-4">
          You agree to defend, indemnify, and hold harmless {companyName}, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </p>
        <p className="mb-4">
          If you wish to terminate your account, you may simply discontinue using the Service or contact us to close your account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Governing Law and Dispute Resolution</h2>
        <p className="mb-4">
          These Terms shall be governed and construed in accordance with {governingLaw}.
        </p>
        <p className="mb-4">
          Any dispute arising from or relating to the subject matter of these Terms shall be finally settled by arbitration in accordance with the rules of the {arbitrationProvider}.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        <p className="mb-4">
          By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mb-4">
          {companyName} <br />
          Email: <a href={`mailto:${contactEmail}`} className="text-astralis-blue hover:underline">{contactEmail}</a>
        </p>
      </section>
    </div>
  );
};

export default TermsOfServicePage;
