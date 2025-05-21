import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key';

export default defineEventHandler(async (event) => {
    const path = event.node.req.url || '';

    if (!path.startsWith('/api/')) {
        return;
    }

    if (
        path.startsWith('/api/auth/login') ||
        path.startsWith('/api/auth/me') ||
        path.startsWith('/api/users') ||
        (path === '/api/forums' && event.node.req.method === 'GET') ||
        path.match(/^\/api\/forums\/\d+$/) && event.node.req.method === 'GET' ||
        path.match(/^\/api\/topics\/\d+$/) && event.node.req.method === 'GET'
    ) {
        return;
    }

    const authHeader = event.node.req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createError({statusCode: 401, message: 'Unauthorized'});
    }

    const token = authHeader.split(' ')[1];

    try {
        event.context.user = jwt.verify(token, JWT_SECRET); // Attach user info to the context
    } catch (err) {
        return createError({statusCode: 401, message: 'Invalid token'});
    }
});