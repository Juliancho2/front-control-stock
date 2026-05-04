import type { RolUsuario } from "$types/index";

// Mapa de rol → ruta de inicio
export const INICIO_POR_ROL: Record<RolUsuario, string> = {
    superadmin: '/superadmin/dashboard',
    cajero: '/pos',
    admin: '/admin/dashboard',
    bodeguero: '/bodega/inventario'
};