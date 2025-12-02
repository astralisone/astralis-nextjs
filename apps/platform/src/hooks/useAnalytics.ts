import { useCallback } from 'react';
import { event, trackPurchase, trackAuditBooking } from '@/lib/analytics/gtag';

/**
 * Custom hook for convenient Google Analytics event tracking
 */
export function useAnalytics() {
  /**
   * Track a custom event
   */
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    event(eventName, parameters);
  }, []);

  /**
   * Track an e-commerce purchase
   */
  const trackPurchaseEvent = useCallback((orderData: {
    id: string;
    total: number;
    items?: any[];
    currency?: string;
  }) => {
    trackPurchase(orderData);
  }, []);

  /**
   * Track an audit booking
   */
  const trackAuditBookingEvent = useCallback((auditType: string) => {
    trackAuditBooking(auditType);
  }, []);

  /**
   * Track a form submission
   */
  const trackFormSubmit = useCallback((formName: string, parameters?: Record<string, any>) => {
    event('form_submit', {
      form_name: formName,
      ...parameters,
    });
  }, []);

  /**
   * Track a button click
   */
  const trackButtonClick = useCallback((buttonName: string, parameters?: Record<string, any>) => {
    event('button_click', {
      button_name: buttonName,
      ...parameters,
    });
  }, []);

  /**
   * Track a link click
   */
  const trackLinkClick = useCallback((linkUrl: string, parameters?: Record<string, any>) => {
    event('link_click', {
      link_url: linkUrl,
      ...parameters,
    });
  }, []);

  return {
    trackEvent,
    trackPurchaseEvent,
    trackAuditBookingEvent,
    trackFormSubmit,
    trackButtonClick,
    trackLinkClick,
  };
}
