import mysql from 'mysql2/promise'
import bluebird from 'bluebird'
import type { EventHandler, EventHandlerRequest } from 'h3'
import bcrypt from 'bcrypt'

export const defineWrappedResponseHandler = <T extends EventHandlerRequest, D>(handler: EventHandler<T, D>): EventHandler<T, D> =>
    defineEventHandler<T>(async event => {
        try {
            const connection = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root',
                database: 'forum',
                Promise: bluebird,
            })
            event.context.mysql = connection
            const response = await handler(event)
            await event.context.mysql.end()
            return response
        } catch (err) {
            console.error('Database error:', err)
            return { error: 'Database error', details: err }
        }
    })

// Fonction pour initialiser la base de données
export async function initDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        Promise: bluebird,
    })

    try {
        // Créer la base de données si elle n'existe pas
        await connection.query(`CREATE DATABASE IF NOT EXISTS forum`)
        
        // Utiliser la base de données
        await connection.query(`USE forum`)
        
        // Créer les tables
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS forums (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS topics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                forum_id INT NOT NULL,
                user_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_message_user_id INT,
                FOREIGN KEY (forum_id) REFERENCES forums(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (last_message_user_id) REFERENCES users(id) ON DELETE SET NULL
            )
        `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                topic_id INT NOT NULL,
                user_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `)

        // Vérifier si l'utilisateur admin existe
        const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin'])
        
        if (Array.isArray(rows) && rows.length === 0) {
            // Créer l'utilisateur admin par défaut
            const hashedPassword = await bcrypt.hash('admin', 10)
            await connection.query(
                'INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)',
                ['admin', hashedPassword, true]
            )
            console.log('Admin user created successfully')
        }

        console.log('Database initialized successfully')
    } catch (error) {
        console.error('Database initialization error:', error)
    } finally {
        await connection.end()
    }
}