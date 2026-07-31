'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { consentStorageKey } from '../../lib/analytics';

export default function ConsentManager({ measurementId, salesIqWidgetUrl }) {
  const [preference, setPreference] = useState('loading');

  useEffect(() => {
    setPreference(window.localStorage.getItem(consentStorageKey) || 'unset');

    const reopen = () => setPreference('unset');
    window.addEventListener('estospaces:open-cookie-preferences', reopen);
    return () => window.removeEventListener('estospaces:open-cookie-preferences', reopen);
  }, []);

  if (!measurementId && !salesIqWidgetUrl) return null;

  const choose = (value) => {
    window.localStorage.setItem(consentStorageKey, value);
    if (preference === 'accepted' && value === 'rejected') {
      window.location.reload();
      return;
    }
    setPreference(value);
  };

  return (
    <>
      {preference === 'accepted' ? (
        <>
          {measurementId ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-consented" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  window.gtag = function(){window.dataLayer.push(arguments);};
                  window.gtag('js', new Date());
                  window.gtag('config', '${measurementId}', { anonymize_ip: true });
                `}
              </Script>
            </>
          ) : null}
          {salesIqWidgetUrl ? (
            <>
              <Script id="zoho-salesiq-consented" strategy="afterInteractive">
                {`
                  window.$zoho = window.$zoho || {};
                  window.$zoho.salesiq = window.$zoho.salesiq || {};
                  window.$zoho.salesiq.ready = window.$zoho.salesiq.ready || function(){};
                  window.$zoho.salesiq.afterReady = function() {
                    if (typeof window.$zoho.salesiq.privacy?.updateCookieConsent === 'function') {
                      window.$zoho.salesiq.privacy.updateCookieConsent(['analytics', 'performance']);
                    }
                  };
                `}
              </Script>
              <Script id="zsiqscript" src={salesIqWidgetUrl} strategy="afterInteractive" />
            </>
          ) : null}
        </>
      ) : null}
      {preference === 'unset' ? (
        <section
          aria-label="Cookie preferences"
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
        >
          <h2 className="text-lg font-bold text-gray-950">Choose optional website tools</h2>
          <p className="mt-2 leading-6 text-gray-600">
            Essential site functions work without optional tools. With your permission, analytics
            and Zoho SalesIQ help us understand visits and offer live support. We do not send search
            text, contact details, messages, or documents to our website analytics. Read the{' '}
            <a className="font-semibold text-primary underline" href="/cookies">
              cookie policy
            </a>
            .
          </p>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-xl border border-gray-300 px-5 font-semibold text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
              onClick={() => choose('rejected')}
              type="button"
            >
              Reject optional tools
            </button>
            <button
              className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-orange-200"
              onClick={() => choose('accepted')}
              type="button"
            >
              Allow analytics &amp; chat
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
