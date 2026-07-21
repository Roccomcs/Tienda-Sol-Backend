import { Producto } from '../../models/Producto.js';

describe('Producto Model', () => {
    const crearProducto = (overrides = {}) => new Producto({
        id: '1',
        titulo: 'Producto Test',
        precio: 100,
        stock: 10,
        activo: true,
        cantidadVendida: 0,
        ...overrides
    });

    describe('estaDisponible', () => {
        test('debería retornar true si está activo y hay stock suficiente', () => {
            const producto = crearProducto({ stock: 10, activo: true });
            expect(producto.estaDisponible(5)).toBe(true);
        });

        test('debería retornar false si el stock es insuficiente', () => {
            const producto = crearProducto({ stock: 3 });
            expect(producto.estaDisponible(5)).toBe(false);
        });

        test('debería retornar false si el producto está inactivo', () => {
            const producto = crearProducto({ stock: 10, activo: false });
            expect(producto.estaDisponible(5)).toBe(false);
        });
    });

    describe('reducirStock', () => {
        test('debería descontar el stock e incrementar la cantidad vendida', () => {
            const producto = crearProducto({ stock: 10, cantidadVendida: 2 });
            producto.reducirStock(3);
            expect(producto.stock).toBe(7);
            expect(producto.cantidadVendida).toBe(5);
        });

        test('debería lanzar error si el stock es insuficiente', () => {
            const producto = crearProducto({ stock: 2 });
            expect(() => producto.reducirStock(5)).toThrow();
        });
    });

    describe('aumentarStock', () => {
        test('debería reponer el stock y reducir la cantidad vendida', () => {
            const producto = crearProducto({ stock: 5, cantidadVendida: 4 });
            producto.aumentarStock(3);
            expect(producto.stock).toBe(8);
            expect(producto.cantidadVendida).toBe(1);
        });

        test('la cantidad vendida no debería ser negativa', () => {
            const producto = crearProducto({ stock: 5, cantidadVendida: 1 });
            producto.aumentarStock(3);
            expect(producto.cantidadVendida).toBe(0);
        });
    });
});
