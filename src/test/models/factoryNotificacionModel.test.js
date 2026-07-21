import { FactoryNotificacion } from '../../models/FactoryNotificacion.js';
import { EstadoPedido } from '../../models/enums/EstadoPedido.js';

describe('FactoryNotificacion', () => {
    const factory = new FactoryNotificacion();

    const pedidoBase = (estado) => ({
        estado,
        comprador: { id: 'comprador1', nombre: 'Carlos' },
        total: 250,
        moneda: 'ARS',
        direccionEntrega: { calle: 'Av. Medrano', altura: '951', ciudad: 'CABA' },
        items: [
            { cantidad: 2, producto: { titulo: 'Auriculares', vendedor: { id: 'vendedor1', nombre: 'Ana' } } }
        ]
    });

    describe('crearSegunEstadoPedido', () => {
        test('debería devolver un mensaje para cada estado', () => {
            expect(typeof factory.crearSegunEstadoPedido(EstadoPedido.PENDIENTE)).toBe('string');
            expect(typeof factory.crearSegunEstadoPedido(EstadoPedido.ENVIADO)).toBe('string');
            expect(typeof factory.crearSegunEstadoPedido(EstadoPedido.CANCELADO)).toBe('string');
        });
    });

    describe('crearSegunPedido', () => {
        test('al crear un pedido (PENDIENTE) debería notificar al vendedor', () => {
            const payloads = factory.crearSegunPedido(pedidoBase(EstadoPedido.PENDIENTE));
            expect(payloads).toHaveLength(1);
            expect(payloads[0].usuarioDestino).toBe('vendedor1');
            expect(payloads[0].mensaje).toContain('Carlos');
        });

        test('al enviar un pedido (ENVIADO) debería notificar al comprador', () => {
            const payloads = factory.crearSegunPedido(pedidoBase(EstadoPedido.ENVIADO));
            expect(payloads).toHaveLength(1);
            expect(payloads[0].usuarioDestino).toBe('comprador1');
        });

        test('al cancelar un pedido (CANCELADO) debería notificar al vendedor', () => {
            const payloads = factory.crearSegunPedido(pedidoBase(EstadoPedido.CANCELADO));
            expect(payloads).toHaveLength(1);
            expect(payloads[0].usuarioDestino).toBe('vendedor1');
        });

        test('debería devolver un arreglo vacío si el estado no genera notificaciones', () => {
            const payloads = factory.crearSegunPedido(pedidoBase(EstadoPedido.ENTREGADO));
            expect(payloads).toEqual([]);
        });

        test('debería devolver un arreglo vacío si el pedido es nulo', () => {
            expect(factory.crearSegunPedido(null)).toEqual([]);
        });

        test('debería resolver ids de usuario provistos como string', () => {
            const pedido = {
                estado: EstadoPedido.PENDIENTE,
                comprador: 'comprador1',
                total: 100,
                moneda: 'ARS',
                direccionEntrega: null,
                items: [{ cantidad: 1, producto: { vendedor: 'vendedor1' } }]
            };
            const payloads = factory.crearSegunPedido(pedido);
            expect(payloads).toHaveLength(1);
            expect(payloads[0].usuarioDestino).toBe('vendedor1');
            expect(payloads[0].mensaje).toContain('sin dirección');
        });

        test('debería resolver ids de usuario provistos como { id }', () => {
            const pedido = {
                estado: EstadoPedido.ENVIADO,
                comprador: { id: 'comprador9' },
                items: [{ cantidad: 2, producto: {} }]
            };
            const payloads = factory.crearSegunPedido(pedido);
            expect(payloads).toHaveLength(1);
            expect(payloads[0].usuarioDestino).toBe('comprador9');
        });

        test('debería notificar a cada vendedor distinto una sola vez', () => {
            const pedido = {
                estado: EstadoPedido.CANCELADO,
                comprador: { _id: 'comprador1', nombre: 'Carlos' },
                items: [
                    { cantidad: 1, producto: { titulo: 'A', vendedor: { _id: 'v1' } } },
                    { cantidad: 1, producto: { titulo: 'B', vendedor: { _id: 'v2' } } },
                    { cantidad: 1, producto: { titulo: 'C', vendedor: { _id: 'v1' } } }
                ]
            };
            const payloads = factory.crearSegunPedido(pedido);
            expect(payloads).toHaveLength(2);
            const destinos = payloads.map(p => p.usuarioDestino).sort();
            expect(destinos).toEqual(['v1', 'v2']);
        });

        test('no debería notificar en ENVIADO si no hay comprador', () => {
            const pedido = { estado: EstadoPedido.ENVIADO, comprador: null, items: [] };
            expect(factory.crearSegunPedido(pedido)).toEqual([]);
        });

        test('crearSegunEstadoPedido debería devolver un mensaje por defecto para estados desconocidos', () => {
            expect(typeof factory.crearSegunEstadoPedido('DESCONOCIDO')).toBe('string');
        });
    });
});
