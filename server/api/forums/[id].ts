import { defineWrappedResponseHandler } from '~/server/utils/mysql';
import { getRouterParam } from 'h3';

export const GET = defineWrappedResponseHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const { mysql } = event.context;
  
  const [forums] = await mysql.query('SELECT * FROM forums WHERE id = ?', [id]);
  
  if (forums.length === 0) {
    return { error: 'Forum not found' };
  }
  
  const forum = forums[0];
  
  const [topics] = await mysql.query(`
    SELECT 
      t.*,
      u.username as author_username,
      lu.username as last_message_username,
      COUNT(m.id) as message_count
    FROM 
      topics t
    JOIN 
      users u ON t.user_id = u.id
    LEFT JOIN 
      users lu ON t.last_message_user_id = lu.id
    LEFT JOIN 
      messages m ON t.id = m.topic_id
    WHERE 
      t.forum_id = ?
    GROUP BY 
      t.id
    ORDER BY 
      t.last_message_at DESC
  `, [id]);
  
  return {
    ...forum,
    topics
  };
});