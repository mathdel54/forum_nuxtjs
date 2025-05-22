import {defineWrappedResponseHandler} from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
    const forumId = event.context.params?.id;

    if (!forumId) {
        return {error: 'Forum ID requis'};
    }

    const {mysql} = event.context;
    await mysql.query('DELETE FROM forums WHERE id = ?', [forumId]);

    return {success: true};
});