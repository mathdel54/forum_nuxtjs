import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
    const sessionId = getCookie(event, 'session_id');

    if (!sessionId) {
        return { error: 'Unauthorized' };
    }

    interface SessionData {
        user: {
            is_admin: boolean;
        }
    }

    const session = await useStorage('sessions').getItem(sessionId) as SessionData;

    if (!session || !session.user.is_admin) {
        return { error: 'Unauthorized' };
    }

    const { name } = await readBody(event);

    if (!name) {
        return { error: 'Name is required' };
    }

    const { mysql } = event.context;
    const [result] = await mysql.query('INSERT INTO forums (name) VALUES (?)', [name]);

    return {
        id: result.insertId,
        name,
        created_at: new Date()
    };
});