import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export class WorkLogRepository {
    constructor() {
        this.db = null;
        this.indexedDB = null;
    }

    async init() {
        if (Platform.OS === 'web') {
            return this._initIndexedDB();
        }

        if (this.db) return this.db;
        this.db = await SQLite.openDatabaseAsync('sunsite.db');

        // Ensure table exists
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS work_logs (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT,
        category TEXT,
        description TEXT,
        sections TEXT,
        photos TEXT,
        timestamp TEXT,
        signature TEXT
      );
    `);

        // Migration: Add sections column if missing
        try {
            await this.db.execAsync('ALTER TABLE work_logs ADD COLUMN sections TEXT;');
        } catch (e) {
            // Column might already exist
        }

        return this.db;
    }

    async _initIndexedDB() {
        if (this.indexedDB) return this.indexedDB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SunSiteDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('work_logs')) {
                    db.createObjectStore('work_logs', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.indexedDB = event.target.result;
                resolve(this.indexedDB);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    async _ensureDb() {
        return this.init();
    }

    async save(workLog) {
        if (Platform.OS === 'web') {
            return this._saveToIndexedDB(workLog);
        }

        const db = await this._ensureDb();
        const { id, title, category, description, sections, photos, timestamp, signature } = workLog.toJSON();
        await db.runAsync(
            'INSERT OR REPLACE INTO work_logs (id, title, category, description, sections, photos, timestamp, signature) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, category, description, JSON.stringify(sections), JSON.stringify(photos), timestamp, signature]
        );
    }

    async _saveToIndexedDB(workLog) {
        const db = await this._ensureDb();
        const data = workLog.toJSON();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['work_logs'], 'readwrite');
            const store = transaction.objectStore('work_logs');
            const request = store.put(data);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getAll() {
        if (Platform.OS === 'web') {
            return this._getAllFromIndexedDB();
        }

        const db = await this._ensureDb();
        const rows = await db.getAllAsync('SELECT * FROM work_logs ORDER BY timestamp DESC');
        return rows.map((row) => ({
            ...row,
            sections: row.sections ? JSON.parse(row.sections) : null,
            photos: JSON.parse(row.photos || '[]'),
        }));
    }

    async _getAllFromIndexedDB() {
        const db = await this._ensureDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['work_logs'], 'readonly');
            const store = transaction.objectStore('work_logs');
            const request = store.getAll();

            request.onsuccess = (event) => {
                const results = event.target.result;
                resolve(results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            };
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
