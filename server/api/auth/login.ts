import bcrypt from 'bcrypt';
import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export const POST = defineWrappedResponseHandler(async (event) => {
  const { username, password } = await readBody(event);
  
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }
  
  const { mysql } = event.context;
  
  const [users] = await mysql.query('SELECT * FROM users WHERE username = ?', [username]);
  
  if (users.length === 0) {
    return { error: 'Invalid username or password' };
  }
  
  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return { error: 'Invalid username or password' };
  }
  
  const session = await useStorage('sessions').setItem(user.id.toString(), {
    user: {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    },
    created_at: new Date()
  });
  
  setCookie(event, 'session_id', user.id.toString(), {
    httpOnly: true,
    maxAge: 3600 * 24 * 7
  });
  
  return {
    id: user.id,
    username: user.username,
    is_admin: user.is_admin
  };
});