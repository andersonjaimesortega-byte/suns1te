import { supabase } from '../../../../shared/utils/supabaseClient';
import { Platform } from 'react-native';

export class AccessRepository {
    constructor() {
        this.indexedDB = null;
    }

    async init() {
        if (this.indexedDB) return this.indexedDB;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SunSiteAccessDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('authorized_ids')) {
                    db.createObjectStore('authorized_ids', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                this.indexedDB = event.target.result;
                resolve(this.indexedDB);
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Sincroniza los IDs autorizados desde Supabase a la caché local.
     */
    async syncIds() {
        try {
            const { data, error } = await supabase
                .from('authorized_ids')
                .select('*');

            if (error) throw error;

            const db = await this.init();
            const transaction = db.transaction(['authorized_ids'], 'readwrite');
            const store = transaction.objectStore('authorized_ids');

            // Limpiar tabla vieja y cargar nueva
            store.clear();
            data.forEach(item => store.put(item));

            console.log('Gatekeeper: IDs sincronizados correctamente.');
            return true;
        } catch (err) {
            console.error('Gatekeeper: Error al sincronizar IDs:', err.message);
            return false;
        }
    }

    /**
     * Valida si un ID es válido para una mini-granja específica (Offline-first).
     */
    async validateAccess(id, miniGranja) {
        const db = await this.init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['authorized_ids'], 'readonly');
            const store = transaction.objectStore('authorized_ids');
            const request = store.get(id);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result && result.mini_granja === miniGranja) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };

            request.onerror = (event) => reject(event.target.error);
        });
    }

    /**
     * Verifica si hay una sesión activa de Gatekeeper.
     */
    async isSessionValid() {
        // Implementar lógica de persistencia de sesión si es necesario
        // Por ahora lo manejaremos en el estado de la aplicación
        return true;
    }
}
