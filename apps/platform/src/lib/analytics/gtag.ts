/**
 * Google Analytics tracking utilities
 * Tracking ID: G-49DWRM7K4G
 */

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'G-49DWRM7K4G';

// Global gtag interface declaration
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

/**
 * Track page views
 */
export const pageview = (url: string, title?: string) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  });
};

/**
 * Track custom events
 */
export const event = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, {
    event_category: 'engagement',
    ...parameters,
  });
};

/**
 * Track purchase conversions
 * Used for e-commerce checkout tracking
 */
export const trackPurchase = (orderData: {
  id: string;
  total: number;
  items?: any[];
  currency?: string;
}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  // Track standard purchase event
  window.gtag('event', 'purchase', {
    transaction_id: orderData.id,
    value: orderData.total,
    currency: orderData.currency || 'USD',
    items: orderData.items,
  });

  // Track ads conversion event
  window.gtag('event', 'ads_conversion_Purchase', {
    transaction_id: orderData.id,
    value: orderData.total,
    currency: orderData.currency || 'USD',
  });
};

/**
 * Track audit booking completion
 */
export const trackAuditBooking = (auditType: string) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'audit_booking_completed', {
    event_category: 'engagement',
    event_label: auditType,
    value: 1,
  });
};
