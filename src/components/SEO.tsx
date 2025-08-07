import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: object;
  additionalMeta?: Array<{ name: string; content: string }>;
}

const SEO: React.FC<SEOProps> = ({
  title = "Leader Leap Assessment Tool - Leadership Competency Gap Analysis",
  description = "Identify and close leadership competency gaps with our comprehensive assessment tool. Evaluate 11 key leadership areas including strategic thinking, emotional intelligence, and team building.",
  keywords = "leadership assessment, competency gap analysis, leadership development, strategic thinking, emotional intelligence, team building, change management, decision making, delegation, negotiation, self-leadership",
  canonical,
  ogImage = "https://leader-leap.com/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  structuredData,
  additionalMeta = []
}) => {
  const fullTitle = title.includes("Leader Leap") ? title : `${title} - Leader Leap Assessment Tool`;
  const currentUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {/* Additional custom meta tags */}
      {additionalMeta.map((meta, idx) => (
        <meta key={idx} name={meta.name} content={meta.content} />
      ))}
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Leader Leap Assessment Tool" />
      <meta property="og:locale" content="en_US" />
      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      <meta property="twitter:site" content="@encouragercoach" />
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 