import {defineWrappedResponseHandler} from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
  // Vérifier si l'utilisateur est authentifié
  const user = event.context.user;
  if (!user) {
    return {error: 'Authentication required'};
  }

  const {forum_id, title, content} = await readBody(event);

  if (!forum_id || !title || !content) {
    return {error: 'Forum ID, title and content are required'};
  }

  const {mysql} = event.context;

  // Vérifier si le forum existe
  const [forums] = await mysql.query('SELECT id FROM forums WHERE id = ?', [forum_id]);

  if (forums.length === 0) {
    return {error: 'Forum not found'};
  }

  // Commencer une transaction
  await mysql.beginTransaction();

  try {
    // Insérer le sujet
    const [topicResult] = await mysql.query(
        'INSERT INTO topics (forum_id, user_id, title, last_message_user_id) VALUES (?, ?, ?, ?)',
        [forum_id, user.id, title, user.id]
    );

    const topicId = topicResult.insertId;

    // Insérer le premier message
    await mysql.query(
        'INSERT INTO messages (topic_id, user_id, content) VALUES (?, ?, ?)',
        [topicId, user.id, content]
    );

    await mysql.commit();

    return {
      id: topicId,
      forum_id,
      user_id: user.id,
      title,
      created_at: new Date(),
      last_message_at: new Date(),
      last_message_user_id: user.id
    };
  } catch (error) {
    await mysql.rollback();
    throw error;
  }
});