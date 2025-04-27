import bcrypt from 'bcrypt';
import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export const GET = defineWrappedResponseHandler(async (event) => {
  const { mysql } = event.context;
  const [users] = await mysql.query('SELECT id, username, is_admin, created_at FROM users');
  return users;
});

export const POST = defineWrappedResponseHandler(async (event) => {
  const { username, password } = await readBody(event);
  
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }
  
  const { mysql } = event.context;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await mysql.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    return {
      id: result.insertId,
      username,
      created_at: new Date()
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      return { error: 'Username already exists' };
    }
    throw error;
  }
});