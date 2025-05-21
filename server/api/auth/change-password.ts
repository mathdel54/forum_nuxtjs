import {defineEventHandler, readBody} from 'h3';
import bcrypt from 'bcrypt';

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  if (!sessionId) {
    return createError({statusCode: 401, message: 'Unauthorized'});
  }

  const session = await useStorage('sessions').getItem(sessionId) as { currentUser: { id: string } };
  if (!session || !session.currentUser) {
    return createError({statusCode: 401, message: 'Unauthorized'});
  }

  const body = await readBody(event);
  const {currentPassword, newPassword} = body;

  if (!currentPassword || !newPassword) {
    return createError({statusCode: 400, message: 'Champs requis manquants'});
  }

  const user = await useStorage('users').getItem(session.currentUser.id) as { id: string; password: string };
  if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
    return createError({statusCode: 403, message: 'Mot de passe actuel incorrect'});
  }

  // Update the user's password in the users storage
  user.password = bcrypt.hashSync(newPassword, 10);
  await useStorage('users').setItem(user.id, user);

  // Update the currentUser in the session
  session.currentUser = {...session.currentUser};
  await useStorage('sessions').setItem(sessionId, session);

  return {success: true, user: session.currentUser};
});