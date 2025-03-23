import { initDatabase } from '../utils/mysql'

export default defineNitroPlugin(async () => {
    console.log('Initialisation de la base de données...')
    await initDatabase()
})