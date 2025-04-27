import { defineWrappedResponseHandler } from '~/server/utils/mysql';
import { broadcastToAll } from '~/server/routes/_ws';

export const POST = defineWrappedResponseHandler(async (event) => {
  const sessionId = getCookie(event, 'session_id');
  if (!sessionId) {
    return { error: 'Authentication required' };
  }
  
  interface SessionData {
    user: {
      id: number | string;
      username: string;
    }
  }
  
  const session = await useStorage('sessions').getItem(sessionId) as SessionData;
  
  if (!session) {
    return { error: 'Authentication required' };
  }
  
  const { topic_id, content } = await readBody(event);
  
  if (!topic_id || !content) {
    return { error: 'Topic ID and content are required' };
  }
  
  const { mysql } = event.context;
  
  // Vérifier si le sujet existe
  const [topics] = await mysql.query('SELECT id, forum_id FROM topics WHERE id = ?', [topic_id]);
  
  if (topics.length === 0) {
    return { error: 'Topic not found' };
  }
  
  const topic = topics[0];
  
  // Commencer une transaction
  await mysql.beginTransaction();
  
  try {
    // Insérer le message
    const [messageResult] = await mysql.query(
      'INSERT INTO messages (topic_id, user_id, content) VALUES (?, ?, ?)',
      [topic_id, session.user.id, content]
    );
    
    // Mettre à jour le sujet
    await mysql.query(
      'UPDATE topics SET last_message_at = CURRENT_TIMESTAMP, last_message_user_id = ? WHERE id = ?',
      [session.user.id, topic_id]
    );
    
    await mysql.commit();
    
    const message = {
      id: messageResult.insertId,
      topic_id,
      user_id: session.user.id,
      content,
      created_at: new Date(),
      updated_at: new Date(),
      author_username: session.user.username
    };
    
    // Notifier les clients WebSocket
    broadcastToAll({
      type: 'new_message',
      message,
      topic_id
    });
    
    return message;
  } catch (error) {
    await mysql.rollback();
    throw error;
  }
});