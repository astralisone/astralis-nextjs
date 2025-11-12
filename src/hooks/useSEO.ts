import { useEffect } from 'react';
import { useRouter } from 'next/router';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  structuredData?: object;
}

// Google Analytics tracking
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

export const useSEO = (config: SEOConfig = {}) => {
  const router = useRouter();
  const currentUrl = `https://astralis.one${router.pathname}`;

  useEffect(() => {
    // Update document title
    if (config.title) {
      document.title = config.title;
    }

    // Update meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('[name=')) {
          element.setAttribute('name', selector.match(/\[name="([^"]*)"/)![1]);
        } else if (selector.includes('[property=')) {
          element.setAttribute('property', selector.match(/\[property="([^"]*)"/)![1]);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    if (config.description) {
      updateMetaTag('meta[name="description"]', config.description);
      updateMetaTag('meta[property="og:description"]', config.description);
      updateMetaTag('meta[property="twitter:description"]', config.description);
    }

    if (config.keywords) {
      updateMetaTag('meta[name="keywords"]', config.keywords);
    }

    if (config.author) {
      updateMetaTag('meta[name="author"]', config.author);
    }

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', config.title || document.title);
    updateMetaTag('meta[property="og:url"]', config.url || currentUrl);
    updateMetaTag('meta[property="og:type"]', config.type || 'website');

    if (config.image) {
      updateMetaTag('meta[property="og:image"]', config.image);
      updateMetaTag('meta[property="twitter:image"]', config.image);
    }

    if (config.publishedTime) {
      updateMetaTag('meta[property="article:published_time"]', config.publishedTime);
    }

    if (config.modifiedTime) {
      updateMetaTag('meta[property="article:modified_time"]', config.modifiedTime);
    }

    // Twitter Card tags
    updateMetaTag('meta[property="twitter:title"]', config.title || document.title);
    updateMetaTag('meta[property="twitter:url"]', config.url || currentUrl);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', config.url || currentUrl);

    // Robots meta
    if (config.noindex) {
      updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    } else {
      updateMetaTag('meta[name="robots"]', 'index, follow');
    }

    // Structured Data
    if (config.structuredData) {
      let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(config.structuredData);
    }

  }, [config, currentUrl]);

  // Google Analytics page tracking
  useEffect(() => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-49DWRM7K4G', {
        page_path: router.asPath,
        page_title: document.title,
      });
    }
  }, [router.asPath]);

  // Track custom events
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        event_category: 'engagement',
        event_label: router.pathname,
        ...parameters,
      });
    }
  };

  // Track page views
  const trackPageView = (path?: string, title?: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-49DWRM7K4G', {
        page_path: path || router.pathname,
        page_title: title || document.title,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
};

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: {
    title: 'Astralis - Creative Agency & Digital Products | AI Solutions & Marketplace',
    description: 'Transform your business with Astralis creative agency. AI solutions, custom software development, and digital products marketplace. Expert consulting for modern enterprises.',
    keywords: 'creative agency, AI solutions, software development, digital products, business automation, custom applications',
    image: 'https://astralis.one/images/astralis-agency-logo.png',
    type: 'website',
  },
  marketplace: {
    title: 'Digital Products Marketplace | AI Tools & Software Solutions - Astralis',
    description: 'Discover premium digital products, AI tools, and software solutions. From custom applications to automation services. Find the perfect solution for your business.',
    keywords: 'digital products, AI tools, software marketplace, business automation, custom software, SaaS products',
    type: 'website',
  },
  blog: {
    title: 'Tech Blog | AI, Web Development & Business Insights - Astralis',
    description: 'Stay updated with the latest in AI, web development, and business technology. Expert insights, tutorials, and industry trends from Astralis team.',
    keywords: 'tech blog, AI insights, web development, business technology, tutorials, industry trends',
    type: 'website',
  },
  contact: {
    title: 'Contact Astralis | Get In Touch for AI Solutions & Custom Development',
    description: 'Ready to transform your business? Contact Astralis for AI solutions, custom development, and digital consulting. Let\'s discuss your project today.',
    keywords: 'contact astralis, AI consultation, custom development inquiry, business transformation, project discussion',
    type: 'website',
  },
} as const;

export default useSEO;