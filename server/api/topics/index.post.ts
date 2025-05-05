import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  
  if (!sessionId) {
    return { error: 'Authentication required' };
  }
  
  const session = await useStorage('sessions').getItem(sessionId) as { user: { id: number } };
  
  if (!session) {
    return { error: 'Authentication required' };
  }
  
  const { forum_id, title, content } = await readBody(event);
  
  if (!forum_id || !title || !content) {
    return { error: 'Forum ID, title and content are required' };
  }
  
  const { mysql } = event.context;
  
  // Vérifier si le forum existe
  const [forums] = await mysql.query('SELECT id FROM forums WHERE id = ?', [forum_id]);
  
  if (forums.length === 0) {
    return { error: 'Forum not found' };
  }
  
  // Commencer une transaction
  await mysql.beginTransaction();
  
  try {
    // Insérer le sujet
    const [topicResult] = await mysql.query(
      'INSERT INTO topics (forum_id, user_id, title, last_message_user_id) VALUES (?, ?, ?, ?)',
      [forum_id, session.user.id, title, session.user.id]
    );
    
    const topicId = topicResult.insertId;
    
    // Insérer le premier message
    const [messageResult] = await mysql.query(
      'INSERT INTO messages (topic_id, user_id, content) VALUES (?, ?, ?)',
      [topicId, session.user.id, content]
    );
    
    await mysql.commit();
    
    return {
      id: topicId,
      forum_id,
      user_id: session.user.id,
      title,
      created_at: new Date(),
      last_message_at: new Date(),
      last_message_user_id: session.user.id
    };
  } catch (error) {
    await mysql.rollback();
    throw error;
  }
});