import { Pedido } from '../../models/Pedido.js';
import { ItemPedido } from '../../models/ItemPedido.js';
import { Producto } from '../../models/Producto.js';
import { EstadoPedido } from '../../models/enums/EstadoPedido.js';

describe('Pedido Model', () => {
    const crearPedido = (overrides = {}) => new Pedido({
        id: '1',
        comprador: { id: 'u1', nombre: 'Carlos' },
        items: [
            { producto: { id: 'p1' }, cantidad: 2, precioUnitario: 100 },
            { producto: { id: 'p2' }, cantidad: 1, precioUnitario: 50 }
        ],
        moneda: 'ARS',
        direccionEntrega: { calle: 'Calle Falsa' },
        ...overrides
    });

    describe('calcularTotal', () => {
        test('debería sumar el subtotal de todos los ítems', () => {
            const pedido = crearPedido();
            expect(pedido.calcularTotal()).toBe(250);
        });

        test('debería usar el método subtotal() cuando los ítems lo tienen', () => {
            const items = [new ItemPedido({ id: 'p1' }, 3, 100)];
            const pedido = crearPedido({ items });
            expect(pedido.calcularTotal()).toBe(300);
        });
    });

    describe('actualizarEstado', () => {
        test('debería permitir pasar de PENDIENTE a ENVIADO y registrar el cambio', () => {
            const pedido = crearPedido();
            pedido.actualizarEstado(EstadoPedido.ENVIADO, 'u1', 'Enviado');
            expect(pedido.estado).toBe(EstadoPedido.ENVIADO);
            expect(pedido.historialEstados).toHaveLength(1);
            expect(pedido.historialEstados[0].estado).toBe(EstadoPedido.ENVIADO);
        });

        test('debería lanzar error ante una transición inválida', () => {
            const pedido = crearPedido();
            expect(() => pedido.actualizarEstado(EstadoPedido.ENTREGADO)).toThrow();
        });

        test('debería lanzar error ante un estado inexistente', () => {
            const pedido = crearPedido();
            expect(() => pedido.actualizarEstado('ESTADO_INVALIDO')).toThrow();
        });
    });

    describe('validarStock', () => {
        test('debería retornar true si todos los productos están disponibles', () => {
            const items = [
                { producto: new Producto({ id: 'p1', titulo: 'A', precio: 100, stock: 10, activo: true }), cantidad: 2 }
            ];
            const pedido = crearPedido({ items });
            expect(pedido.validarStock()).toBe(true);
        });

        test('debería retornar false si algún producto no tiene stock', () => {
            const items = [
                { producto: new Producto({ id: 'p1', titulo: 'A', precio: 100, stock: 1, activo: true }), cantidad: 5 }
            ];
            const pedido = crearPedido({ items });
            expect(pedido.validarStock()).toBe(false);
        });

        test('debería retornar false si un ítem no tiene un producto válido', () => {
            const pedido = crearPedido({ items: [{ producto: null, cantidad: 1 }] });
            expect(pedido.validarStock()).toBe(false);
        });
    });

    describe('constructor', () => {
        test('debería calcular el total automáticamente si no se provee', () => {
            const pedido = crearPedido();
            expect(pedido.total).toBe(250);
        });

        test('debería respetar el total provisto explícitamente', () => {
            const pedido = crearPedido({ total: 999 });
            expect(pedido.total).toBe(999);
        });
    });
});
