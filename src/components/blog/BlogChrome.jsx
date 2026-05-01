'use client';

import React from 'react';
import { ChatProvider } from '../../contexts/ChatContext';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

export default function BlogChrome({ children }) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar activePath="/blogs" forceSolid />
        {children}
        <Footer />
      </div>
    </ChatProvider>
  );
}
