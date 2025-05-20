import { defineEventHandler, readBody } from 'h3';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  if (!sessionId) {
    return createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const session = await useStorage('sessions').getItem(sessionId);
  if (!session) {
    return createError({ statusCode: 401, message: 'Unauthorized' });
  }

  const body = await readBody(event);
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return createError({ statusCode: 400, message: 'Champs requis manquants' });
  }

  const user = await useStorage('users').getItem(session.user.id);
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return createError({ statusCode: 403, message: 'Mot de passe actuel incorrect' });
  }

  user.password = bcrypt.hashSync(newPassword, 10);
  await useStorage('users').setItem(session.user.id, user);

  return { success: true };
});