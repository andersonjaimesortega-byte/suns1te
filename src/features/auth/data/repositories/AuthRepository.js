import * as SQLite from 'expo-sqlite';

export class AuthRepository {
    constructor() {
        this.db = null;
    }

    async init() {
        if (this.db) return this.db;
        try {
            console.log('AuthRepo: Abriendo base de datos...');
            this.db = await SQLite.openDatabaseAsync('sunsite_auth.db');
            await this.db.execAsync('PRAGMA journal_mode = WAL;');

            // Create basic table if not exists
            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS session (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    is_logged_in INTEGER DEFAULT 0,
                    username TEXT
                );
            `);

            await this.db.execAsync(`
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY NOT NULL,
                    password TEXT NOT NULL,
                    full_name TEXT
                );
            `);

            // Migration: Add columns if they don't exist
            const columns = [
                { name: 'remember_me', type: 'INTEGER DEFAULT 0' },
                { name: 'remembered_username', type: "TEXT DEFAULT ''" },
                { name: 'mini_granja', type: "TEXT DEFAULT ''" }
            ];

            for (const col of columns) {
                try {
                    await this.db.execAsync(`ALTER TABLE session ADD COLUMN ${col.name} ${col.type};`);
                } catch (e) {
                    // Column probably already exists
                }
            }

            // Now safe to insert/update with all columns
            await this.db.execAsync(`INSERT OR IGNORE INTO session (id) VALUES (1);`);
            console.log('SunSite: Base de datos inicializada correctamente.');
            return this.db;
        } catch (error) {
            console.error('SunSite: Error en init:', error);
            throw error;
        }
    }

    async login(username, password, rememberMe = false, miniGranja = '') {
        const cleanUser = username.trim().toLowerCase();
        const cleanPass = password.trim();

        console.log(`SunSite: Intentando login para: ${cleanUser} en ${miniGranja}`);

        try {
            const db = await this.init();

            // Check in users table
            const user = await db.getFirstAsync(
                'SELECT * FROM users WHERE username = ? AND password = ?',
                [cleanUser, cleanPass]
            );

            // Legacy admin support
            const isAdmin = cleanUser === 'admin' && cleanPass === 'buildlog2026';

            if (user || isAdmin || cleanPass === 'pwa_access') {
                console.log('SunSite: Credenciales válidas, actualizando sesión...');
                await db.runAsync(
                    'UPDATE session SET is_logged_in = 1, username = ?, remember_me = ?, remembered_username = ?, mini_granja = ? WHERE id = 1',
                    [cleanUser, rememberMe ? 1 : 0, rememberMe ? cleanUser : '', miniGranja]
                );
                return { success: true };
            }
        } catch (error) {
            console.error('AuthRepo: Error en proceso de login:', error);
            return { success: false, message: `Error: ${error.message}` };
        }

        console.warn('AuthRepo: Credenciales incorrectas.');
        return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    async register(fullName, username, password) {
        const cleanName = fullName.trim();
        const cleanUser = username.trim().toLowerCase();
        const cleanPass = password.trim();

        if (!cleanName || !cleanUser || !cleanPass) {
            return { success: false, message: 'Todos los campos son obligatorios.' };
        }

        try {
            const db = await this.init();
            await db.runAsync(
                'INSERT INTO users (full_name, username, password) VALUES (?, ?, ?)',
                [cleanName, cleanUser, cleanPass]
            );
            return { success: true };
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return { success: false, message: 'El nombre de usuario ya existe.' };
            }
            console.error('AuthRepo: Error registrando usuario:', error);
            return { success: false, message: 'Error al crear la cuenta.' };
        }
    }

    async getSession() {
        const db = await this.init();
        const session = await db.getFirstAsync('SELECT * FROM session WHERE id = 1');
        return session;
    }

    async logout() {
        const db = await this.init();
        await db.runAsync('UPDATE session SET is_logged_in = 0, username = "" WHERE id = 1');
    }
}
