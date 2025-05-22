import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
  const forumId = event.context.params?.id;
  const body = await readBody(event);
  const { name } = body;

  if (!forumId || !name) {
    return { error: 'Forum ID et nouveau nom requis' };
  }

  const { mysql } = event.context;
  await mysql.query('UPDATE forums SET name = ? WHERE id = ?', [name, forumId]);

  return { success: true };
});