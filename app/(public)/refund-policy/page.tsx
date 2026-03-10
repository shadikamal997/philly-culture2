import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy | Philly Culture',
  description: 'Refund and return policy for Philly Culture online academy and shop',
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Refund & Return Policy
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Last Updated: March 5, 2026
        </p>

        <div className="prose dark:prose-invert max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Our Commitment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              At Philly Culture, we want you to be completely satisfied with your purchase. If for any reason
              you're not happy with your order, we're here to help. Please review our refund and return policy below.
            </p>
          </section>

          {/* Physical Products */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Physical Products & Merchandise
            </h2>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  1.1 Return Window
                </h3>
                <p>
                  You have <strong>30 days</strong> from the date of delivery to return physical products
                  for a full refund or exchange.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  1.2 Return Conditions
                </h3>
                <p className="mb-2">To be eligible for a return, items must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be in original, unused condition</li>
                  <li>Include all original packaging and tags</li>
                  <li>Not be damaged or altered</li>
                  <li>Include proof of purchase (order confirmation email)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  1.3 Non-Returnable Items
                </h3>
                <p className="mb-2">The following items cannot be returned:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personalized or custom-made items</li>
                  <li>Food products or perishable goods</li>
                  <li>Items marked as final sale</li>
                  <li>Gift cards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  1.4 Return Shipping
                </h3>
                <p className="mb-2">
                  <strong>Customer responsibility:</strong> You are responsible for return shipping costs
                  unless the item is defective or we made an error.
                </p>
                <p className="mb-2">
                  <strong>Defective or wrong items:</strong> We will provide a prepaid return label if
                  the item arrived damaged, defective, or incorrect.
                </p>
                <p>
                  <strong>Recommendation:</strong> Use a trackable shipping method and purchase shipping
                  insurance. We cannot guarantee receipt of returns without tracking.
                </p>
              </div>
            </div>
          </section>

          {/* Digital Products and Courses */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Online Courses & Digital Products
            </h2>
            
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.1 14-Day Satisfaction Guarantee
                </h3>
                <p>
                  We offer a <strong>14-day money-back guarantee</strong> on all online courses. If you're
                  not satisfied with a course, you may request a refund within 14 days of purchase.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.2 Eligibility Requirements
                </h3>
                <p className="mb-2">To be eligible for a course refund:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request must be made within 14 days of purchase</li>
                  <li>You must not have completed more than 30% of the course</li>
                  <li>You must not have downloaded course materials excessively</li>
                  <li>Course content must be materially different from description or defective</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.3 Non-Refundable Circumstances
                </h3>
                <p className="mb-2">Refunds will not be provided if:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You've completed more than 30% of the course</li>
                  <li>Request is made after the 14-day window</li>
                  <li>You violate our Terms of Service</li>
                  <li>You've successfully completed the course and received a certificate</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  2.4 Course Access After Refund
                </h3>
                <p>
                  Upon approval of a refund, your access to the course will be immediately revoked.
                  You will no longer be able to view course materials or participate in course discussions.
                </p>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. How to Request a Refund
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
                <p className="font-semibold mb-4">Step-by-Step Process:</p>
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Contact Support:</strong> Email us at refunds@phillyculture.com with your
                    order number and reason for return/refund
                  </li>
                  <li>
                    <strong>Await Authorization:</strong> We'll review your request and respond within
                    1-2 business days
                  </li>
                  <li>
                    <strong>For Physical Products:</strong> If approved, we'll provide return instructions
                    and a return authorization number
                  </li>
                  <li>
                    <strong>Ship Item Back:</strong> Package the item securely and ship to the provided
                    address with tracking
                  </li>
                  <li>
                    <strong>Refund Processing:</strong> Once we receive and inspect the return, we'll
                    process your refund
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Required Information
                </h3>
                <p className="mb-2">Please include in your refund request:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Order number</li>
                  <li>Email address used for purchase</li>
                  <li>Item(s) to be returned</li>
                  <li>Reason for return</li>
                  <li>Preferred resolution (refund or exchange)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Timeline */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Refund Processing Timeline
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <p className="mb-2"><strong>Digital Products/Courses:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Approval decision: 1-2 business days</li>
                  <li>Refund processing: 3-5 business days after approval</li>
                  <li>Bank processing: 5-10 business days (varies by institution)</li>
                </ul>
              </div>

              <div>
                <p className="mb-2"><strong>Physical Products:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Return receipt and inspection: 3-5 business days after we receive the item</li>
                  <li>Refund processing: 3-5 business days after inspection</li>
                  <li>Bank processing: 5-10 business days (varies by institution)</li>
                </ul>
              </div>

              <p className="mt-4">
                <strong>Note:</strong> Refunds are issued to the original payment method. If you don't
                receive your refund within the specified timeframe, please check with your bank first,
                then contact us at refunds@phillyculture.com
              </p>
            </div>
          </section>

          {/* Exchanges */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Exchanges
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We accept exchanges for physical products within 30 days of delivery. The fastest way
                to get your desired item is to return the original item and make a new purchase.
              </p>
              
              <p>
                <strong>Size exchanges:</strong> If you need a different size, contact us and we'll
                help facilitate the exchange at no additional shipping cost (within the US).
              </p>

              <p className="font-semibold mt-4">
                Digital courses cannot be exchanged, but you may purchase additional courses at any time.
              </p>
            </div>
          </section>

          {/* Damaged or Defective Items */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Damaged or Defective Items
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                If your item arrives damaged or defective, please contact us immediately at
                support@phillyculture.com with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Order number</li>
                <li>Photos of the damaged item</li>
                <li>Description of the issue</li>
              </ul>
              
              <p className="mt-4">
                We'll provide a prepaid return label and send a replacement immediately or issue a full
                refund including original shipping costs.
              </p>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-4">
                <p className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Important: Please report damaged or defective items within 7 days of delivery.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Costs */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Shipping Costs
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Non-refundable:</strong> Original shipping charges are non-refundable unless
                the return is due to our error or a defective product.
              </p>
              
              <p>
                <strong>Return shipping:</strong> You are responsible for return shipping costs unless
                the item is defective, damaged, or we shipped the wrong item.
              </p>

              <p>
                <strong>Free shipping orders:</strong> If you received free shipping on your order,
                the actual shipping cost will be deducted from your refund.
              </p>
            </div>
          </section>

          {/* Cancellations */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Order Cancellations
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Before Shipping:</strong> You may cancel your order for a full refund if it
                hasn't shipped yet. Contact us immediately at orders@phillyculture.com
              </p>
              
              <p>
                <strong>After Shipping:</strong> Once an order has shipped, you must follow the standard
                return process.
              </p>

              <p>
                <strong>Digital Products:</strong> Course purchases can be cancelled for a full refund
                within 24 hours if no content has been accessed.
              </p>
            </div>
          </section>

          {/* Special Circumstances */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Special Circumstances
            </h2>
            
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>
                We understand that special circumstances may arise. If you have an extenuating situation
                outside our standard policy, please contact us at support@phillyculture.com We review
                each case individually and will work with you to find a fair solution.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Questions?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you have any questions about our refund policy, please don't hesitate to contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Philly Culture Customer Support</strong><br />
                Email: refunds@phillyculture.com<br />
                Support: support@phillyculture.com<br />
                Website: www.phillyculture.com/contact<br />
                <br />
                <em>We typically respond within 1-2 business days</em>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
