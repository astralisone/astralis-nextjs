import { useCallback } from 'react';
import { event, trackPurchase, trackAuditBooking } from '@/lib/analytics/gtag';

/**
 * Custom hook for tracking analytics events
 * Provides convenient wrappers for common tracking scenarios
 */
export function useAnalytics() {
  /**
   * Track a custom event
   */
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    event(eventName, parameters);
  }, []);

  /**
   * Track a purchase conversion
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
   * Track audit booking completion
   */
  const trackAuditBookingEvent = useCallback((auditType: string) => {
    trackAuditBooking(auditType);
  }, []);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((formName: string, additionalData?: Record<string, any>) => {
    event('form_submit', {
      form_name: formName,
      ...additionalData,
    });
  }, []);

  /**
   * Track button click
   */
  const trackButtonClick = useCallback((buttonName: string, additionalData?: Record<string, any>) => {
    event('button_click', {
      button_name: buttonName,
      ...additionalData,
    });
  }, []);

  /**
   * Track link click
   */
  const trackLinkClick = useCallback((linkUrl: string, linkText?: string) => {
    event('link_click', {
      link_url: linkUrl,
      link_text: linkText,
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
