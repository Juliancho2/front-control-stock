import { api } from './fetch';
import type { Plan } from '$types/index';

export const planesApi = {
    listar: (token?: string) => api.get<Plan[]>('/planes', { token }),
};
