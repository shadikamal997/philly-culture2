import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Philly Culture',
  description: 'Terms of Service for Philly Culture online academy and shop',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: March 5, 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using Philly Culture's website, online academy, or purchasing our products,
              you agree to be bound by these Terms of Service and all applicable laws and regulations.
              If you do not agree with any of these terms, you are prohibited from using this site.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Definitions
            </h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>"Service"</strong> refers to the Philly Culture website, online academy, and all related services.</li>
              <li><strong>"Products"</strong> includes both physical merchandise and digital courses.</li>
              <li><strong>"User"</strong> refers to anyone who accesses or uses our Service.</li>
              <li><strong>"Account"</strong> refers to the unique account created to access our Service.</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Account Registration
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          {/* Purchases and Payments */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Purchases and Payments
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>4.1 Pricing:</strong> All prices are in US Dollars and include applicable sales tax.
                Prices are subject to change without notice.
              </p>
              <p>
                <strong>4.2 Payment:</strong> We accept payment through Stripe. By providing payment information,
                you represent that you are authorized to use the payment method.
              </p>
              <p>
                <strong>4.3 Order Confirmation:</strong> You will receive an email confirmation for each order.
                This confirmation does not constitute acceptance of your order.
              </p>
              <p>
                <strong>4.4 Sales Tax:</strong> Sales tax is calculated based on your shipping address and
                applicable state and local tax rates.
              </p>
            </div>
          </section>

          {/* Course Access and Digital Products */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Course Access and Digital Products
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>5.1 License:</strong> Upon purchase, you receive a non-exclusive, non-transferable
                license to access course content for personal use only.
              </p>
              <p>
                <strong>5.2 Access:</strong> Course access is granted immediately upon successful payment
                and remains available indefinitely unless terminated for violation of these terms.
              </p>
              <p>
                <strong>5.3 Restrictions:</strong> You may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share your account credentials with others</li>
                <li>Download, copy, or redistribute course content</li>
                <li>Use content for commercial purposes</li>
                <li>Remove or circumvent any security measures</li>
              </ul>
            </div>
          </section>

          {/* Shipping and Delivery */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Shipping and Delivery
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>6.1 Shipping Costs:</strong> Calculated based on destination, weight, and selected shipping method.
              </p>
              <p>
                <strong>6.2 Processing Time:</strong> Orders are typically processed within 1-3 business days.
              </p>
              <p>
                <strong>6.3 Delivery Estimates:</strong> Provided at checkout are estimates only. We are not
                responsible for delays caused by carriers or circumstances beyond our control.
              </p>
              <p>
                <strong>6.4 International Shipping:</strong> Customs fees and import duties are the buyer's responsibility.
              </p>
            </div>
          </section>

          {/* Refunds and Returns */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Refunds and Returns
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>7.1 Physical Products:</strong> May be returned within 30 days of delivery in original condition.
                Shipping costs are non-refundable.
              </p>
              <p>
                <strong>7.2 Digital Products/Courses:</strong> Due to the nature of digital products, refunds are
                provided on a case-by-case basis within 14 days of purchase if course content is defective or
                materially different from description.
              </p>
              <p>
                <strong>7.3 Refund Processing:</strong> Approved refunds are processed within 5-10 business days
                to the original payment method.
              </p>
            </div>
          </section>

          {/* Intellectual PropertyIntellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              All content, including but not limited to text, graphics, logos, images, videos, and course materials,
              is the property of Philly Culture and protected by copyright, trademark, and other intellectual property laws.
              Unauthorized use is strictly prohibited.
            </p>
          </section>

          {/* User Conduct */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Prohibited Activities
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit harmful code or viruses</li>
              <li>Attempt to gain unauthorized access</li>
              <li>Engage in automated data collection</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use the Service for fraudulent purposes</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Disclaimers
            </h2>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
                EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
              <p>
                COURSE RESULTS MAY VARY. WE MAKE NO GUARANTEES REGARDING SKILL IMPROVEMENT OR OUTCOMES FROM
                TAKING OUR COURSES.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, PHILLY CULTURE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES,
              WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the Commonwealth
              of Pennsylvania, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to modify these Terms at any time. Changes will be effective immediately
              upon posting. Your continued use of the Service after changes constitutes acceptance of the
              modified Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Philly Culture</strong><br />
                Email: legal@phillyculture.com<br />
                Website: www.phillyculture.com/contact
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
