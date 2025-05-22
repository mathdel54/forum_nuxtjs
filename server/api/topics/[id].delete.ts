import { defineWrappedResponseHandler } from '~/server/utils/mysql';
import { broadcastToAll } from '~/server/routes/_ws';

export default defineWrappedResponseHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) {
    return { error: 'Topic ID is required' };
  }

  const { mysql } = event.context;

  try {
    // Démarrer une transaction
    await mysql.beginTransaction();

    // Supprimer les messages associés au topic
    await mysql.query('DELETE FROM messages WHERE topic_id = ?', [id]);

    // Supprimer le topic
    const [result] = await mysql.query('DELETE FROM topics WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      throw new Error('Topic not found');
    }

    // Valider la transaction
    await mysql.commit();

    // Diffuser un message via WebSocket
    broadcastToAll({
      type: 'topic_deleted',
      topic_id: parseInt(id),
    });

    return { success: true };
  } catch (error) {
    // Annuler la transaction en cas d'erreur
    await mysql.rollback();
    return { error: error instanceof Error ? error.message : 'An error occurred while deleting the topic' };
  }
});