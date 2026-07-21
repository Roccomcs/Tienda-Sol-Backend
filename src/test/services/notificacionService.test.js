import { jest } from "@jest/globals";
import NotificacionService from '../../services/notificacionService.js';
import { EstadoPedido } from '../../models/enums/EstadoPedido.js';
import { NotificacionNoEncontradaError } from '../../middlewares/notificacionErrors.js';

describe('NotificacionService', () => {
    let notificacionService;
    let mockNotificacionRepository;

    const notificacionId = '507f1f77bcf86cd799439011';
    const usuarioId = '507f1f77bcf86cd799439012';

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockNotificacionRepository = {
            createNotificacion: jest.fn(),
            getNotificacionesByUsuarioId: jest.fn(),
            getNotificacionById: jest.fn(),
            marcarComoLeida: jest.fn()
        };

        notificacionService = new NotificacionService(mockNotificacionRepository);
    });

    describe('crearNotificacionesPorPedido', () => {
        const pedido = {
            estado: EstadoPedido.PENDIENTE,
            comprador: { id: 'comprador1', nombre: 'Carlos' },
            total: 200,
            moneda: 'ARS',
            direccionEntrega: { calle: 'Av. Medrano' },
            items: [{ cantidad: 1, producto: { titulo: 'Auriculares', vendedor: { id: 'vendedor1' } } }]
        };

        test('Debe persistir las notificaciones generadas por la factory', async () => {
            mockNotificacionRepository.createNotificacion.mockResolvedValue({ _id: notificacionId });
            const result = await notificacionService.crearNotificacionesPorPedido(pedido);
            expect(result).toHaveLength(1);
            expect(mockNotificacionRepository.createNotificacion).toHaveBeenCalledTimes(1);
        });

        test('No debe crear notificaciones si la factory no genera payloads', async () => {
            const pedidoEntregado = { ...pedido, estado: EstadoPedido.ENTREGADO };
            const result = await notificacionService.crearNotificacionesPorPedido(pedidoEntregado);
            expect(result).toEqual([]);
            expect(mockNotificacionRepository.createNotificacion).not.toHaveBeenCalled();
        });
    });

    describe('getNotificacionesByUsuarioId', () => {
        test('Debe devolver las notificaciones del usuario', async () => {
            mockNotificacionRepository.getNotificacionesByUsuarioId.mockResolvedValue([
                { _id: notificacionId, usuarioDestino: usuarioId, mensaje: 'Hola', leida: false }
            ]);
            const result = await notificacionService.getNotificacionesByUsuarioId(usuarioId, 'false');
            expect(result.status).toBe(200);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('marcarNotificacionLeida', () => {
        test('Debe marcar una notificación como leída', async () => {
            mockNotificacionRepository.getNotificacionById.mockResolvedValue({ _id: notificacionId, leida: false });
            mockNotificacionRepository.marcarComoLeida.mockResolvedValue({ _id: notificacionId, leida: true, fechaLeida: new Date() });
            const result = await notificacionService.marcarNotificacionLeida(usuarioId, notificacionId);
            expect(result.status).toBe(200);
            expect(result.data.leida).toBe(true);
        });

        test('Debe lanzar error si la notificación no existe', async () => {
            mockNotificacionRepository.getNotificacionById.mockResolvedValue(null);
            await expect(notificacionService.marcarNotificacionLeida(usuarioId, notificacionId)).rejects.toThrow(NotificacionNoEncontradaError);
        });
    });
});
