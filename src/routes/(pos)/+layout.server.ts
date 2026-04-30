import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: LayoutServerLoad = async ({ locals, fetch }) => {
    const API_BASE = env.PUBLIC_API_URL ?? 'http://localhost:3000';
    
    let turnoActivo = null;
    
    if (locals.accessToken) {
        try {
            const res = await fetch(`${API_BASE}/api/v1/caja/turnos/activo`, {
                headers: {
                    'Authorization': `Bearer ${locals.accessToken}`
                }
            });
            
            if (res.ok) {
                const json = await res.json();
                turnoActivo = json.data;
            }
        } catch (error) {
            console.error('Error fetching turno activo in server load:', error);
        }
    }
    
    return {
        turnoActivo
    };
};
