// Define session interface
interface SessionData {
  user: {
    is_admin: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

export default defineEventHandler(async (event) => {
  // Exclure les routes qui ne nécessitent pas d'authentification
  const path = event.node.req.url || '';
  
  if (path.startsWith('/api/auth/login') || 
      path.startsWith('/api/auth/me') ||
      path === '/api/forums' && event.node.req.method === 'GET' ||
      path.match(/^\/api\/forums\/\d+$/) && event.node.req.method === 'GET' ||
      path.match(/^\/api\/topics\/\d+$/) && event.node.req.method === 'GET') {
    return;
  }
  
  const sessionId = getCookie(event, 'session_id');
  
  if (!sessionId) {
    return createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }
  
  const session = await useStorage('sessions').getItem(sessionId) as SessionData;
  
  if (!session) {
    deleteCookie(event, 'session_id');
    return createError({
      statusCode: 401,
      message: 'Unauthorized'
    });
  }
  
  // Si la route nécessite des privilèges d'admin
  if ((path === '/api/forums' && event.node.req.method === 'POST') || 
      path.match(/^\/api\/forums\/\d+$/) && 
      (event.node.req.method === 'PUT' || event.node.req.method === 'DELETE')) {
    if (!session.user.is_admin) {
      return createError({
        statusCode: 403,
        message: 'Forbidden'
      });
    }
  }
});