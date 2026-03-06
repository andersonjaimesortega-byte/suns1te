import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

export class SettingsRepository {
    constructor() {
        this.db = null;
        this.indexedDB = null;
    }

    async init() {
        if (Platform.OS === 'web') {
            return this._initIndexedDB();
        }

        if (this.db) return this.db;
        this.db = await SQLite.openDatabaseAsync('sunsite_settings.db');
        await this.db.execAsync(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT
            );
        `);
        return this.db;
    }

    async _initIndexedDB() {
        if (this.indexedDB) return this.indexedDB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SunSiteSettingsDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.indexedDB = event.target.result;
                resolve(this.indexedDB);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    async getResidentName() {
        if (Platform.OS === 'web') {
            const val = await this._getFromIndexedDB('resident_name');
            return val || 'Ingeniero Residente';
        }

        const db = await this.init();
        const result = await db.getFirstAsync('SELECT value FROM settings WHERE key = ?', ['resident_name']);
        return result ? result.value : 'Ingeniero Residente';
    }

    async _getFromIndexedDB(key) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = (event) => resolve(event.target.result?.value);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    async setResidentName(name) {
        if (Platform.OS === 'web') {
            return this._setToIndexedDB('resident_name', name);
        }

        const db = await this.init();
        await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['resident_name', name]);
    }

    async _setToIndexedDB(key, value) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    }
}
