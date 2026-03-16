// ARCHIVO AUTO-GENERADO POR SPACETIMEDB CLI - NO EDITAR MANUALMENTE
// Este archivo simula el contenido de src/module_bindings/index.ts

import { ConnectionId, Identity } from 'spacetimedb';

export type OperationHistory = {
    id: number;
    amountGiven: number;
    price: number;
    change: number;
    timestamp: bigint;
    userId: string;
};

export const tables = {
    operationHistory: {
        tableName: 'operation_history',
        // Métodos de utilidad generados...
    }
};

export const reducers = {
    addOperation: (amountGiven: number, price: number, change: number) => {
        // Implementación generada...
    },
    clearHistory: () => {
        // Implementación generada...
    }
};

export class DbConnectionBuilder {
    // Implementación del builder del SDK...
}
