import { createClient } from '@supabase/supabase-js';

// Reemplazar con tus credenciales de Supabase
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const isValidUrl = (url) => {
    try {
        new URL(url);
        return !url.includes('YOUR_SUPABASE_URL');
    } catch (e) {
        return false;
    }
};

export const supabase = isValidUrl(SUPABASE_URL)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : {
        from: () => ({ select: () => ({ data: [], error: { message: 'Configuración de Supabase pendiente' } }) }),
        auth: { getSession: async () => ({ data: { session: null }, error: null }) }
    };

console.log('SunSite: Cliente Supabase ' + (isValidUrl(SUPABASE_URL) ? 'conectado.' : 'en modo offline/pendiente config.'));
