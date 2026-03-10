import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Philly Culture',
  description: 'Privacy Policy for Philly Culture online academy and shop',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: March 5, 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Philly Culture ("we," "our," or "us") respects your privacy and is committed to protecting your
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
              your information when you visit our website and use our services.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.1 Information You Provide
                </h3>
                <p className="mb-2">We collect information you voluntarily provide when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create an account (name, email, password)</li>
                  <li>Make a purchase (billing and shipping address, payment information)</li>
                  <li>Enroll in courses (educational background, preferences)</li>
                  <li>Contact us (name, email, message content)</li>
                  <li>Subscribe to newsletters (email address)</li>
                  <li>Participate in surveys or promotions</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.2 Automatically Collected Information
                </h3>
                <p className="mb-2">When you access our Service, we automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clickstream data)</li>
                  <li>Location data (general geographic location based on IP address)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.3 Third-Party Information
                </h3>
                <p className="mb-2">We may receive information from third parties:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment processors (Stripe) for transaction verification</li>
                  <li>Analytics providers for usage statistics</li>
                  <li>Social media platforms if you link your accounts</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use your information to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Provide access to purchased courses and content</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to customer service requests</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and trends</li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Legal Basis for Processing (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you are from the European Economic Area (EEA), our legal basis for processing your information includes:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Contract Performance:</strong> Processing necessary to fulfill our contract with you</li>
              <li><strong>Consent:</strong> You have given explicit permission for specific processing</li>
              <li><strong>Legitimate Interests:</strong> Processing necessary for our legitimate business interests</li>
              <li><strong>Legal Compliance:</strong> Processing required to comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. How We Share Your Information
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We may share your information with:</p>
              
              <div>
                <p className="font-semibold mb-2">Service Providers:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Payment processors (Stripe)</li>
                  <li>Email service providers (Resend)</li>
                  <li>Hosting and cloud storage (Firebase)</li>
                  <li>Analytics providers</li>
                  <li>Shipping carriers</li>
                </ul>
              </div>

              <div>
                <p className="font-semibold mb-2">Legal Requirements:</p>
                <p>We may disclose your information if required by law, court order, or to protect our rights and safety.</p>
              </div>

              <div>
                <p className="font-semibold mb-2">Business Transfers:</p>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              </div>

              <p className="font-semibold">
                We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences</li>
                <li>Analyze website traffic and usage patterns</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p>
                You can control cookies through your browser settings. Note that disabling cookies may affect
                your ability to use certain features of our Service.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Data Security
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We implement appropriate technical and organizational security measures to protect your information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure authentication with Firebase</li>
                <li>Regular security assessments</li>
                <li>Limited access to personal information</li>
                <li>Secure payment processing through PCI-compliant providers</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. We cannot guarantee
                absolute security of your information.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Data Retention
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal information for as long as necessary to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide you with our services</li>
              <li>Comply with legal obligations (e.g., tax records for 7 years)</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain account records while your account is active</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 mt-4">
              You may request deletion of your account and personal data at any time, subject to legal retention requirements.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Your Privacy Rights
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw previously given consent</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at privacy@phillyculture.com
              </p>
            </div>
          </section>

          {/* California Privacy Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. California Privacy Rights (CCPA)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              California residents have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Right to know what personal information is collected, used, shared, or sold</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale of personal information (we do not sell your information)</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our Service is not intended for children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from a
              child under 13, please contact us immediately.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. International Data Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Your information may be transferred to and processed in countries other than your country
              of residence. These countries may have different data protection laws. By using our Service,
              you consent to such transfers.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting the new policy on this page and updating the "Last Updated" date.
              Your continued use of the Service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions or concerns about this Privacy Policy or our data practices:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Philly Culture</strong><br />
                Email: privacy@phillyculture.com<br />
                Website: www.phillyculture.com/contact<br />
                <br />
                <em>For EU/EEA residents, you also have the right to lodge a complaint with your
                local data protection authority.</em>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
