'use client';

import { useEffect } from 'react';
import { ChatProvider } from '../contexts/ChatContext';
import Home from '../components/landing/Home';

export default function LandingPage() {
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const error = event.reason;
      const isAbortError = error && (
        error.name === 'AbortError' ||
        error.message?.includes('aborted') ||
        error.message?.includes('AbortError') ||
        error.code === 'ABORT_ERR'
      );

      if (isAbortError) {
        event.preventDefault();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return (
    <ChatProvider>
      <Home />
    </ChatProvider>
  );
}
