import { api } from './fetch';
import type { Tenant } from '$types/index';

export const tenantsApi = {
    listar: (token?: string) => api.get<Tenant[]>('/tenants', { token }),

    obtener: (id: string, token?: string) => api.get<Tenant>(`/tenants/${id}`, { token }),

    dashboard: (token?: string) => api.get<{
        totalTenants: number;
        tenantsActivos: number;
        tenantsInactivos: number;
        totalPlanes: number;
        tenantsPorPlan: { plan: string; cantidad: number }[];
        ultimosTenants: Tenant[];
    }>('/tenants/dashboard', { token }),

    crear: (
        data: {
            nombre: string;
            slug: string;
            planId?: string;
            admin: { nombre: string; email: string; password: string };
        },
        token?: string,
    ) => api.post<{ tenant: Tenant; usuario: { id: string; nombre: string; email: string } }>(
        '/tenants/con-admin',
        data,
        { token },
    ),

    actualizar: (id: string, data: Partial<Tenant>, token?: string) =>
        api.patch<Tenant>(`/tenants/${id}`, data, { token }),
};
