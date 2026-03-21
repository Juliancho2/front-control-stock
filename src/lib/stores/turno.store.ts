import { writable, derived, get } from 'svelte/store';
import type { TurnoCaja } from '$types/index';

const { subscribe, set, update } = writable<TurnoCaja | null>(null);

export const turnoStore = {
    subscribe,
    set,

    inicializar: (turno: TurnoCaja | null) => set(turno),

    sumarVenta: (monto: number) => {
        update(t => t ? { ...t, totalVentas: t.totalVentas + monto } : t);
    },

    cerrar: () => set(null),

    get turnoId(): string | null {
        return get({ subscribe })?.id ?? null;
    },
};

export const turnoActivo = derived({ subscribe }, $t => $t);
export const hayTurnoAbierto = derived({ subscribe }, $t => $t !== null && $t.estado === 'abierto');
export const turnoId = derived({ subscribe }, $t => $t?.id ?? null);