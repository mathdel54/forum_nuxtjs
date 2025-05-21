import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key';

export default defineEventHandler(async (event) => {
  const authHeader = event.node.req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      authenticated: true,
      user: decoded,
    };
  } catch (err) {
    return { authenticated: false };
  }
});