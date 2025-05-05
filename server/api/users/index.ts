import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
  const { mysql } = event.context;
  const [users] = await mysql.query('SELECT id, username, is_admin, created_at FROM users');
  return users;
});