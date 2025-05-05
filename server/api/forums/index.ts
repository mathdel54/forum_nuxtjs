import { defineWrappedResponseHandler } from '~/server/utils/mysql';

export default defineWrappedResponseHandler(async (event) => {
    const { mysql } = event.context;
    const [forums] = await mysql.query(`
        SELECT
            f.*,
            COUNT(DISTINCT t.id) as topic_count
        FROM
            forums f
                LEFT JOIN
            topics t ON f.id = t.forum_id
        GROUP BY
            f.id
    `);
    return forums;
});