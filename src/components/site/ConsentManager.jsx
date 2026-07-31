'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import { consentStorageKey } from '../../lib/analytics';

export default function ConsentManager({ measurementId }) {
  const [preference, setPreference] = useState('loading');

  useEffect(() => {
    setPreference(window.localStorage.getItem(consentStorageKey) || 'unset');

    const reopen = () => setPreference('unset');
    window.addEventListener('estospaces:open-cookie-preferences', reopen);
    return () => window.removeEventListener('estospaces:open-cookie-preferences', reopen);
  }, []);

  if (!measurementId) return null;

  const choose = (value) => {
    window.localStorage.setItem(consentStorageKey, value);
    setPreference(value);
  };

  return (
    <>
      {preference === 'accepted' ? (
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
      {preference === 'unset' ? (
        <section
          aria-label="Cookie preferences"
          className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6"
        >
          <h2 className="text-lg font-bold text-gray-950">Choose whether to allow analytics</h2>
          <p className="mt-2 leading-6 text-gray-600">
            Essential site functions work without analytics. With your permission, anonymous usage
            events help us understand the website. We never include search text or contact details.
            Read the{' '}
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
              Reject analytics
            </button>
            <button
              className="min-h-11 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-orange-200"
              onClick={() => choose('accepted')}
              type="button"
            >
              Accept analytics
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
