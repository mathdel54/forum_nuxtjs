import {defineWrappedResponseHandler} from '~/server/utils/mysql';
import bcrypt from 'bcrypt';

export default defineWrappedResponseHandler(async (event) => {
    const body = await readBody(event);
    const {username, password} = body;

    if (!username || !password) {
        return {error: 'Nom d\'utilisateur et mot de passe requis'};
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const {mysql} = event.context;

    await mysql.query('INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)', [
        username,
        hashedPassword,
        true,
    ]);

    return {success: true};
});