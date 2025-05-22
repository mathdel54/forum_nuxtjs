import {defineWrappedResponseHandler} from '~/server/utils/mysql';
import { readBody } from 'h3';

export default defineWrappedResponseHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        return {error: 'Authentication required'};
    }

    const messageId = event.context.params?.id;
    const body = await readBody(event);
    const newContent = body?.content;

    if (!messageId) {
        return {error: 'Message ID is required'};
    }

    if (!newContent || newContent.trim() === '') {
        return {error: 'Message content cannot be empty'};
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

    // Mettre à jour le message
    await mysql.query('UPDATE messages SET content = ? WHERE id = ?', [newContent, messageId]);

    return {success: true};
});