import { handleNewsletter, optionsResponse } from '../../../lib/server/landingApi.js';

export const dynamic = 'force-dynamic';

export function OPTIONS(request) {
  return optionsResponse(request);
}

export function POST(request) {
  return handleNewsletter(request);
}
