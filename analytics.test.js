import assert from 'node:assert/strict';
import test from 'node:test';

import { trackEvent } from './src/lib/analytics.js';

function analyticsWindow(salesiq) {
  return {
    $zoho: salesiq ? { salesiq } : undefined,
    localStorage: {
      getItem: () => 'accepted',
    },
  };
}

test('landing actions queue safely until SalesIQ is ready', () => {
  global.window = analyticsWindow();

  assert.equal(
    trackEvent('navigation_clicked', {
      destination: 'app|email=private@example.com',
      ignored: 'private-value',
    }),
    true,
  );

  assert.deepEqual(global.window.__estospacesZohoActions, ['estospaces:navigation_clicked']);
  delete global.window;
});

test('landing actions send immediately after SalesIQ is ready', () => {
  const actions = [];
  global.window = analyticsWindow({
    visitor: {
      customaction: (action) => actions.push(action),
    },
  });

  assert.equal(trackEvent('login_clicked', { placement: 'hero' }), true);
  assert.deepEqual(actions, ['estospaces:login_clicked|placement=hero']);
  delete global.window;
});
