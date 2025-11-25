// src/app/privacy-policy/page.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  const companyName = "Astralis One"; // Placeholder - Replace with your actual company name
  const contactEmail = "privacy@astralisone.com"; // Placeholder - Replace with your actual privacy contact email
  const effectiveDate = "November 24, 2025"; // Placeholder - Replace with the actual effective date

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-astralis-blue">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-6">Effective Date: {effectiveDate}</p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
        <p className="mb-4">
          Welcome to {companyName}! We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website
          and use our services (collectively, the "Service").
        </p>
        <p>
          Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
        <p className="mb-4">We may collect personal information about you in a variety of ways. The information we may collect via the Service depends on the content and materials you use, and includes:</p>
        <h3 className="text-xl font-semibold mb-2">2.1. Personal Data</h3>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>**Account Data:** When you register for an account, we collect your name, email address, password, and any other information you provide (e.g., company name, role, team size).</li>
          <li>**Communication Data:** Information you provide when you communicate with us, such as support inquiries, feedback, or survey responses.</li>
          <li>**Payment Data:** If you make purchases through the Service, we collect payment information such as credit card numbers, billing addresses, and transaction details. Note: We use third-party payment processors (e.g., Stripe, PayPal) and do not directly store your full payment card details.</li>
          <li>**Profile Data:** Information you choose to provide in your user profile, such as a profile picture, bio, or additional contact details.</li>
        </ul>
        <h3 className="text-xl font-semibold mb-2">2.2. Derivative Data</h3>
        <p className="mb-4">Information our servers automatically collect when you access the Service, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Service.</p>
        <h3 className="text-xl font-semibold mb-2">2.3. Data from Integrations</h3>
        <p className="mb-4">Our Service integrates with various third-party services (e.g., n8n, Google Calendar, OpenAI, Anthropic). When you enable such integrations, we may collect and process data from these services as authorized by you and in accordance with their privacy policies. This may include calendar events, emails, documents, or other relevant data necessary for the integration's functionality.</p>
        <h3 className="text-xl font-semibold mb-2">2.4. Cookies and Tracking Technologies</h3>
        <p>We may use cookies, web beacons, tracking pixels, and other tracking technologies on the Service to help customize the Service and improve your experience. For more information on how we use cookies, please see our Cookie Policy (if applicable) or the relevant section below.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
        <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>Create and manage your account.</li>
          <li>Deliver and operate the services you request.</li>
          <li>Process transactions and send you related information, including purchase confirmations and invoices.</li>
          <li>Enable user-to-user communications (where applicable).</li>
          <li>Generate a personal profile about you to make your visit to the Service more personalized.</li>
          <li>Improve the efficiency and operation of the Service.</li>
          <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
          <li>Notify you of updates to the Service.</li>
          <li>Offer new products, services, mobile applications, and/or recommendations to you.</li>
          <li>Perform other business activities as needed.</li>
          <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
          <li>Request feedback and contact you about your use of the Service.</li>
          <li>Resolve disputes and troubleshoot problems.</li>
          <li>Respond to product and customer service requests.</li>
          <li>Send you marketing communications, newsletters, and promotional offers (you can opt-out at any time).</li>
          <li>Assist law enforcement and respond to subpoena.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Disclosure of Your Information</h2>
        <p className="mb-4">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
        <h3 className="text-xl font-semibold mb-2">4.1. By Law or to Protect Rights</h3>
        <p className="mb-4">If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</p>
        <h3 className="text-xl font-semibold mb-2">4.2. Third-Party Service Providers</h3>
        <p className="mb-4">We may share your information with third parties that perform services for us or on our behalf, including data analysis, payment processing, email delivery, hosting services, customer service, and marketing assistance.</p>
        <h3 className="text-xl font-semibold mb-2">4.3. Marketing Communications</h3>
        <p className="mb-4">With your consent, or with an opportunity for you to withdraw consent, we may share your information with third parties for marketing purposes, as permitted by law.</p>
        <h3 className="text-xl font-semibold mb-2">4.4. Business Transfers</h3>
        <p className="mb-4">If we reorganize or sell all or a portion of our assets, undergo a merger, or are acquired by another entity, we may transfer your information to the successor entity.</p>
        <h3 className="text-xl font-semibold mb-2">4.5. Other Third Parties</h3>
        <p className="mb-4">We may share your information with our affiliates, business partners, to offer you certain products, services or promotions.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Security of Your Information</h2>
        <p className="mb-4">
          We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
        <p className="mb-4">Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside ml-4 mb-4">
          <li>**Right to Access:** You have the right to request copies of your personal data.</li>
          <li>**Right to Rectification:** You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
          <li>**Right to Erasure (Right to be Forgotten):** You have the right to request that we erase your personal data, under certain conditions.</li>
          <li>**Right to Restrict Processing:** You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
          <li>**Right to Object to Processing:** You have the right to object to our processing of your personal data, under certain conditions.</li>
          <li>**Right to Data Portability:** You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          <li>**Right to Withdraw Consent:** Where we rely on your consent to process your personal data, you have the right to withdraw that consent at any time.</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the contact information provided below.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. Cookies and Similar Technologies</h2>
        <p className="mb-4">
          Most web browsers are set to accept cookies by default. If you prefer, you can choose to set your browser to remove cookies and to reject cookies. If you choose to remove cookies or reject cookies, this could affect certain features or services of our Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">8. Links to Other Websites</h2>
        <p className="mb-4">
          Our Service may contain links to third-party websites and services that are not affiliated with us. Once you have used these links to leave the Service, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information. Before visiting and providing any information to any third-party websites, you should inform yourself of the privacy policies and practices of the third party responsible for that website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
        <p className="mb-4">
          Our Service is not intended for individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
        <p className="mb-4">
          We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Effective Date" and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
        <p className="mb-4">
          If you have questions or comments about this Privacy Policy, please contact us at:
        </p>
        <p className="mb-4">
          {companyName} <br />
          Email: <a href={`mailto:${contactEmail}`} className="text-astralis-blue hover:underline">{contactEmail}</a>
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
