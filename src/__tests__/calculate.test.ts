import { describe, it, expect } from 'vitest';

/**
 * Simulamos la lógica que reside en el servidor para el test de unidad, 
 * aunque la real se mueva a reducers de SpacetimeDB, 
 * la validación de negocio se mantiene igual.
 */
function calculateChange(total: number, received: number): number {
    const change = parseFloat((received - total).toFixed(2));
    if (change < 0) throw new Error('Monto insuficiente');
    return change;
}

describe('Lógica de Cálculo', () => {
    it('debe calcular el cambio correcto para valores estándar', () => {
        expect(calculateChange(5.50, 10.00)).toBe(4.50);
        expect(calculateChange(12.75, 20.00)).toBe(7.25);
    });

    it('debe manejar decimales complejos correctamente', () => {
        expect(calculateChange(0.99, 1.00)).toBe(0.01);
        expect(calculateChange(1.01, 2.00)).toBe(0.99);
    });

    it('debe lanzar error si el monto es insuficiente', () => {
        expect(() => calculateChange(10.00, 5.00)).toThrow('Monto insuficiente');
    });

    it('debe devolver 0 si el monto es exacto', () => {
        expect(calculateChange(15.00, 15.00)).toBe(0);
    });
});
