import { table, reducers, ReducerContext, primaryKey, autoInc } from 'spacetimedb';

// Tabla principal de historial de operaciones
@table({ public: true })
export class OperationHistory {
    @primaryKey
    @autoInc
    id!: number;
    amountGiven!: number; // Importe entregado
    price!: number;       // Precio del artículo
    change!: number;      // Cambio calculado
    timestamp!: bigint;   // Unix timestamp en ms
    userId!: string;      // Identity del usuario (anónimo o autenticado)
}

// Reducers (lógica server-side dentro de SpacetimeDB)
@reducers
export function addOperation(
    ctx: ReducerContext,
    amountGiven: number,
    price: number,
    change: number
): void {
    const timestamp = BigInt(Date.now());
    const userId = ctx.sender.toHexString(); // Usamos la identidad del remitente

    // Validaciones básicas de negocio
    if (amountGiven <= 0 || price <= 0 || change < 0) {
        throw new Error("Valores de operación inválidos");
    }

    OperationHistory.insert({
        amountGiven,
        price,
        change,
        timestamp,
        userId,
    });
}

@reducers
export function clearHistory(ctx: ReducerContext): void {
    // Solo permitimos borrar si es necesario, 
    // en una app real aquí validaríamos permisos
    for (const op of OperationHistory.iter()) {
        OperationHistory.delete(op.id);
    }
}
