
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const Privacy = () => {
  return (
    <>
      <SEO title="Privacy Policy - Leader Leap" description="Privacy policy (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-encourager mb-2">Privacy Policy</h1>
            <p className="text-slate-600 mb-8 italic">Last updated: May 30, 2025</p>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-lg mb-6">
                Leader Leap ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our leadership gap assessment application and related services (the "Service").
              </p>
              
              <p className="mb-8">
                By using Leader Leap, you agree to the collection and use of information in accordance with this policy.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">1. Personal Information</h3>
              <p className="mb-4">We may collect the following personal information from you:</p>
              <ul className="list-disc pl-6 mb-6 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>User-generated content (such as responses to assessments and other information you choose to provide)</li>
              </ul>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2. Usage Data and Analytics</h3>
              <p className="mb-4">
                We may collect non-personal information about how you access and use the Service. This may include your device's Internet Protocol (IP) address, browser type, browser version, the pages you visit, the time and date of your visit, and other diagnostic data.
              </p>
              <p className="mb-6">
                We may use analytics tools (such as Google Analytics or similar services) to help us understand how our Service is used and to improve user experience.
              </p>
              
              <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3. Cookies and Tracking Technologies</h3>
              <p className="mb-6">
                We may use cookies and similar tracking technologies to monitor activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Provide and maintain the Service</li>
                <li>Personalize your experience</li>
                <li>Communicate with you, including sending emails via third-party services such as Brevo</li>
                <li>Respond to your inquiries and provide support</li>
                <li>Improve our Service and develop new features</li>
                <li>Analyze usage of our Service and improve user experience through analytics tools</li>
                <li>Process payments and manage paid features if and when they are introduced</li>
              </ul>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Third-Party Services</h2>
              <p className="mb-4">
                We may share your information with third-party service providers that help us operate and improve our Service. These may include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Brevo</strong> for email marketing and communications</li>
                <li><strong>Google Analytics</strong> or similar analytics providers for usage analysis</li>
                <li><strong>Payment processors</strong> (such as Stripe, PayPal, or others) to handle transactions for paid features</li>
              </ul>
              <p className="mb-6">
                These third parties are only given access to the information necessary to perform their functions and are obligated not to disclose or use it for other purposes.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Payments</h2>
              <p className="mb-6">
                If you choose to purchase a paid feature through Leader Leap, your payment information will be processed directly by a third-party payment processor. We do not store or have access to your full payment details (such as credit card numbers). Please review the privacy policy of the payment processor for more information about how your data is handled.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Data Security</h2>
              <p className="mb-6">
                We strive to use commercially acceptable means to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we work to protect your data, we cannot guarantee its absolute security.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">International Users</h2>
              <p className="mb-6">
                Leader Leap may be accessed by users worldwide. By using our Service, you consent to the processing and transfer of your information in and to countries outside of your own, which may have different data protection laws.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Your Rights</h2>
              <p className="mb-6">
                Depending on your location, you may have certain rights regarding your personal data, such as the right to access, correct, or delete your information, or to object to certain uses. To exercise these rights, please contact us at info@encouragercoaching.com.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Changes to This Privacy Policy</h2>
              <p className="mb-6">
                We may update our Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. We encourage you to review this Privacy Policy periodically.
              </p>
              
              <hr className="my-8 border-slate-200" />
              
              <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or your personal information, please contact us at:
              </p>
              <p className="font-medium text-encourager">
                info@encouragercoaching.com
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;
