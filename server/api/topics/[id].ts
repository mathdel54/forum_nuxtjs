import { defineWrappedResponseHandler } from '~/server/utils/mysql';
import { broadcastToAll } from '~/server/routes/_ws';

export default defineWrappedResponseHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    return { error: 'Topic ID is required' };
  }
  const { mysql } = event.context;
  
  // Récupérer le sujet
  const [topics] = await mysql.query(`
    SELECT 
      t.*,
      u.username as author_username,
      f.name as forum_name,
      f.id as forum_id
    FROM 
      topics t
    JOIN 
      users u ON t.user_id = u.id
    JOIN 
      forums f ON t.forum_id = f.id
    WHERE 
      t.id = ?
  `, [id]);
  
  if (topics.length === 0) {
    return { error: 'Topic not found' };
  }
  
  const topic = topics[0];
  
  // Récupérer les messages
  const [messages] = await mysql.query(`
    SELECT 
      m.*,
      u.username as author_username
    FROM 
      messages m
    JOIN 
      users u ON m.user_id = u.id
    WHERE 
      m.topic_id = ?
    ORDER BY 
      m.created_at ASC
  `, [id]);
  
  return {
    ...topic,
    messages
  };
});