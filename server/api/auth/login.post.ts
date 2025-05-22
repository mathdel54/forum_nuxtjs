import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {defineWrappedResponseHandler} from '~/server/utils/mysql';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
export default defineWrappedResponseHandler(async (event) => {
  const { username, password } = await readBody(event);

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }
  const { mysql } = event.context;

  const [users] = await mysql.query('SELECT * FROM users WHERE username = ?', [username]);

  if (users.length === 0) {
    return { error: 'Invalid username' };
  }

  const user = users[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return { error: 'Invalid password' };
  }

  // Generate JWT token
  const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin,
      },
      JWT_SECRET,
      {expiresIn: '1d'} // Token valid for 1 days
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    },
  };
});