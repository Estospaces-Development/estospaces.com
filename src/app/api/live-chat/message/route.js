import { handleChatMessage, optionsResponse } from '../../../../lib/server/landingApi.js';

export const dynamic = 'force-dynamic';

export function OPTIONS(request) {
  return optionsResponse(request);
}

export function POST(request) {
  return handleChatMessage(request);
}
