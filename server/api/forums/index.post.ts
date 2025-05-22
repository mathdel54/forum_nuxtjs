import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {

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