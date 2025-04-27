export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  if (sessionId) {
    await useStorage('sessions').removeItem(sessionId);
    deleteCookie(event, 'session_id');
  }
  return { success: true };
});