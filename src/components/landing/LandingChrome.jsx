'use client';

import React from 'react';
import { ChatProvider } from '../../contexts/ChatContext';
import Navbar from './Navbar';
import Footer from './Footer';

export default function LandingChrome({ children, activePath = '/' }) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar activePath={activePath} forceSolid />
        {children}
        <Footer />
      </div>
    </ChatProvider>
  );
}
