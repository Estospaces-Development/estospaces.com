'use client';

import { useEffect, useState } from 'react';

// Visitor market for display only (owner, 11 Oct): India sees rupees and Indian sample content, everyone else
// sees the UK version. Decided from the device time zone; no network call, nothing stored. Prices charged at
// checkout still follow the verified billing market.
const INDIA_ZONES = new Set(['Asia/Kolkata', 'Asia/Calcutta']);

export const detectMarket = () => {
  try {
    return INDIA_ZONES.has(Intl.DateTimeFormat().resolvedOptions().timeZone) ? 'IN' : 'UK';
  } catch {
    return 'UK';
  }
};

// Server render and first paint use the UK version; after mount the visitor's market takes over.
export function useMarket() {
  const [market, setMarket] = useState('UK');
  useEffect(() => {
    setMarket(detectMarket());
  }, []);
  return market;
}

// Fictional sample content shown in the product moments on the page.
export const SAMPLE = {
  IN: {
    brief: { area: 'Anna Nagar, Chennai', budget: '₹35-40k / month', moveIn: 'November' },
    briefLine: '2BHK to rent · Anna Nagar · ₹35-40k',
    replies: [
      ['RK', 'Rahul K.', '6 min'],
      ['PN', 'Priya N.', '9 min'],
    ],
    leads: [
      {
        initials: 'AR',
        name: 'Ananya R.',
        detail: '2BHK to rent · ₹35-40k · Nov',
        from: 6 * 60 + 41,
      },
      {
        initials: 'RM',
        name: 'Rohan M.',
        detail: '1BHK to rent · ₹22k / month',
        from: 8 * 60 + 14,
      },
      { initials: 'FZ', name: 'Farhan & Zoya', detail: '3BHK to buy · ₹1.6 Cr', badge: 'Docs in' },
    ],
  },
  UK: {
    brief: { area: 'Didsbury, Manchester', budget: '£1,100-1,300 pcm', moveIn: 'November' },
    briefLine: '2-bed flat to rent · Didsbury · £1,100-1,300 pcm',
    replies: [
      ['OB', 'Oliver B.', '6 min'],
      ['AS', 'Amelia S.', '9 min'],
    ],
    leads: [
      {
        initials: 'ST',
        name: 'Sophie T.',
        detail: '2-bed flat to rent · £1,250 pcm · Nov',
        from: 6 * 60 + 41,
      },
      { initials: 'JP', name: 'James P.', detail: '1-bed flat · £950 pcm', from: 8 * 60 + 14 },
      {
        initials: 'HB',
        name: 'Hannah & Ben',
        detail: '3-bed house to buy · £425k',
        badge: 'Docs in',
      },
    ],
  },
};
