
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import SEO from '@/components/SEO';

const PrivacyNotice = () => {
  return (
    <>
      <SEO title="Privacy Notice - Leader Leap" description="Privacy notice (private)" additionalMeta={[{ name: 'robots', content: 'noindex, nofollow' }]} />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <Navigation />
        </div>
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-3xl font-bold text-encourager mb-8">Privacy Notice</h1>
            
            <div className="prose prose-slate max-w-none space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Who We Are</h2>
                <p>
                  Encourager Limited is the data controller for the personal information you provide to us. You can contact us at info@encourager.co.uk if you have any questions about how we handle your personal data.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">What Information We Collect</h2>
                <p>When you complete our leadership gap assessment, we collect:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Your name</li>
                  <li>Your email address</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Why We Collect This Information</h2>
                <p>We collect your personal information for two purposes:</p>
                <ol className="list-decimal pl-6 mt-2 space-y-2">
                  <li><strong>To deliver your assessment results</strong> - We need your email address to send you your personalised leadership gap assessment report</li>
                  <li><strong>To keep in touch about executive coaching services</strong> - With your separate consent, we may contact you about our executive coaching services and related professional development opportunities</li>
                </ol>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Legal Basis for Processing</h2>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>For delivering your assessment results:</strong> Your consent</li>
                  <li><strong>For marketing communications:</strong> Your separate, explicit consent (which you can withdraw at any time)</li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">How Long We Keep Your Information</h2>
                <p>
                  We will keep your name and email address for up to 3 years from the date you complete the assessment. This allows us to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Provide ongoing support related to your assessment</li>
                  <li>Send you relevant professional development information (if you've consented to marketing)</li>
                  <li>Maintain records for business purposes</li>
                </ul>
                <p className="mt-2">
                  After 3 years, we will securely delete your personal information unless you have engaged with our services or communications during that period.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Who We Share Your Information With</h2>
                <p>
                  We do not share your personal information with any third parties. Your data stays with us.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Your Rights</h2>
                <p>Under GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Rectification</li>
                  <li>Erasure</li>
                  <li>Restrict processing</li>
                  <li>Data portability</li>
                  <li>Object</li>
                  <li>Withdraw consent</li>
                </ul>
                <p className="mt-2">
                  To exercise any of these rights, please contact us at info@encourager.co.uk.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">How We Protect Your Information</h2>
                <p>
                  We take appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure or destruction.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Changes to This Privacy Notice</h2>
                <p>
                  We may update this privacy notice from time to time. Any changes will be posted on this page with an updated revision date.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold text-encourager mt-8 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this privacy notice or how we handle your personal data, please contact us at info@encourager.co.uk.
                </p>
              </div>
              
              <div className="border-t pt-6 mt-8">
                <p className="text-sm text-slate-600 italic">
                  Last updated: 9 July 2025
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyNotice;
