import {defineWrappedResponseHandler} from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        return {error: 'Authentication required'};
    }

    const messageId = event.context.params?.id;
    if (!messageId) {
        return {error: 'Message ID is required'};
    }

    const {mysql} = event.context;

    // Vérifier si le message existe
    const [messages] = await mysql.query('SELECT * FROM messages WHERE id = ?', [messageId]);
    if (messages.length === 0) {
        return {error: 'Message not found'};
    }

    const message = messages[0];

    // Vérifier les permissions
    if (message.user_id !== user.id && !user.is_admin) {
        return {error: 'Permission denied'};
    }

    // Supprimer le message
    await mysql.query('DELETE FROM messages WHERE id = ?', [messageId]);

    return {success: true};
});