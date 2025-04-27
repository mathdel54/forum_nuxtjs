import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export const GET = defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  
  if (!sessionId) {
    return { authenticated: false };
  }
  
  const session = await useStorage('sessions').getItem(sessionId);
  
  if (!session || typeof session !== 'object' || !('user' in session)) {
    deleteCookie(event, 'session_id');
    return { authenticated: false };
  }
  
  return {
    authenticated: true,
    user: session.user
  };
});