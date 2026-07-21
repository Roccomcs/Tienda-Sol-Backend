import { jest } from "@jest/globals";
import PedidoService from '../../services/pedidoService.js';
import { Pedido } from '../../models/Pedido.js';
import { EstadoPedido } from '../../models/enums/EstadoPedido.js';
import {
    PedidoValidacionError,
    PedidoNoEncontradoError,
    PedidoCancelacionError,
    PedidoEstadoInvalidoError
} from '../../middlewares/pedidoErrors.js';
import { ProductoNoEncontradoError, ProductoSinStockError } from '../../middlewares/productoErrors.js';
import { UsuarioNoEncontradoError } from '../../middlewares/usuarioErrors.js';
import { UsuarioNoAutorizadoError } from '../../middlewares/authErrors.js';

describe('PedidoService', () => {
    let pedidoService;
    let mockPedidoRepository;
    let mockProductoRepository;
    let mockUsuarioRepository;
    let mockNotificacionService;

    const compradorId = '507f1f77bcf86cd799439011';
    const vendedorId = '507f1f77bcf86cd799439012';
    const productoId = '507f1f77bcf86cd799439013';
    const pedidoId = '507f1f77bcf86cd799439014';

    // Producto simulado que responde a estaDisponible
    const productoDisponible = (disponible = true) => ({
        _id: productoId,
        titulo: 'Auriculares',
        precio: 100,
        moneda: 'ARS',
        vendedor: { _id: vendedorId },
        estaDisponible: () => disponible
    });

    // Pedido de dominio real (para ejercitar la máquina de estados)
    const pedidoDominio = (estado = EstadoPedido.PENDIENTE) => new Pedido({
        id: pedidoId,
        comprador: { _id: compradorId, nombre: 'Carlos' },
        items: [{ producto: { _id: productoId, vendedor: { _id: vendedorId } }, cantidad: 2, precioUnitario: 100 }],
        moneda: 'ARS',
        direccionEntrega: { calle: 'Av. Medrano' },
        estado
    });

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockPedidoRepository = {
            createPedido: jest.fn(),
            getPedidoById: jest.fn(),
            getPedidosByCompradorId: jest.fn(),
            getPedidosByProductoIds: jest.fn(),
            savePedido: jest.fn()
        };
        mockProductoRepository = {
            getProductoById: jest.fn(),
            reducirStock: jest.fn(),
            aumentarStock: jest.fn(),
            getIdsByVendedor: jest.fn()
        };
        mockUsuarioRepository = { getUsuarioById: jest.fn() };
        mockNotificacionService = { crearNotificacionesPorPedido: jest.fn() };

        pedidoService = new PedidoService(
            mockPedidoRepository,
            mockProductoRepository,
            mockUsuarioRepository,
            mockNotificacionService
        );
    });

    describe('createPedido', () => {
        const payload = {
            items: [{ productoId, cantidad: 2 }],
            direccionEntrega: { calle: 'Av. Medrano' }
        };

        test('Debe crear un pedido, reducir stock y notificar al vendedor', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: compradorId });
            mockProductoRepository.getProductoById.mockResolvedValue(productoDisponible(true));
            mockPedidoRepository.createPedido.mockResolvedValue(pedidoDominio());

            // --- ACT ---
            const result = await pedidoService.createPedido(compradorId, payload);

            // --- ASSERT ---
            expect(result.status).toBe(201);
            expect(mockProductoRepository.reducirStock).toHaveBeenCalledWith(productoId, 2);
            expect(mockNotificacionService.crearNotificacionesPorPedido).toHaveBeenCalledTimes(1);
        });

        test('Debe lanzar error de validación si el payload es inválido', async () => {
            await expect(pedidoService.createPedido(compradorId, { items: [] })).rejects.toThrow(PedidoValidacionError);
        });

        test('Debe lanzar error si un producto no existe', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: compradorId });
            mockProductoRepository.getProductoById.mockResolvedValue(null);
            await expect(pedidoService.createPedido(compradorId, payload)).rejects.toThrow(ProductoNoEncontradoError);
        });

        test('Debe lanzar error si un producto no tiene stock', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: compradorId });
            mockProductoRepository.getProductoById.mockResolvedValue(productoDisponible(false));
            await expect(pedidoService.createPedido(compradorId, payload)).rejects.toThrow(ProductoSinStockError);
        });
    });

    describe('marcarEnviado', () => {
        test('Debe marcar como enviado y notificar al comprador', async () => {
            const pedido = pedidoDominio(EstadoPedido.PENDIENTE);
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedido);
            mockPedidoRepository.savePedido.mockResolvedValue(pedido);

            const result = await pedidoService.marcarEnviado(pedidoId, vendedorId);

            expect(result.status).toBe(200);
            expect(pedido.estado).toBe(EstadoPedido.ENVIADO);
            expect(mockNotificacionService.crearNotificacionesPorPedido).toHaveBeenCalledTimes(1);
        });

        test('Debe lanzar error si el pedido no existe', async () => {
            mockPedidoRepository.getPedidoById.mockResolvedValue(null);
            await expect(pedidoService.marcarEnviado(pedidoId, vendedorId)).rejects.toThrow(PedidoNoEncontradoError);
        });

        test('Debe lanzar error si el vendedor no tiene productos en el pedido', async () => {
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedidoDominio(EstadoPedido.PENDIENTE));
            await expect(pedidoService.marcarEnviado(pedidoId, 'otroVendedor')).rejects.toThrow(UsuarioNoAutorizadoError);
        });

        test('Debe lanzar error si el pedido no está pendiente', async () => {
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedidoDominio(EstadoPedido.ENVIADO));
            await expect(pedidoService.marcarEnviado(pedidoId, vendedorId)).rejects.toThrow(PedidoEstadoInvalidoError);
        });
    });

    describe('cancelarPedido', () => {
        test('Debe cancelar el pedido, reponer stock y notificar al vendedor', async () => {
            const pedido = pedidoDominio(EstadoPedido.PENDIENTE);
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedido);
            mockPedidoRepository.savePedido.mockResolvedValue(pedido);

            const result = await pedidoService.cancelarPedido(pedidoId, compradorId, 'Ya no lo quiero');

            expect(result.status).toBe(200);
            expect(pedido.estado).toBe(EstadoPedido.CANCELADO);
            expect(mockProductoRepository.aumentarStock).toHaveBeenCalledWith(productoId, 2);
        });

        test('Debe lanzar error si lo intenta cancelar otro comprador', async () => {
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedidoDominio(EstadoPedido.PENDIENTE));
            await expect(pedidoService.cancelarPedido(pedidoId, 'otroComprador', 'x')).rejects.toThrow(UsuarioNoAutorizadoError);
        });

        test('Debe lanzar error si el pedido ya fue enviado', async () => {
            mockPedidoRepository.getPedidoById.mockResolvedValue(pedidoDominio(EstadoPedido.ENVIADO));
            await expect(pedidoService.cancelarPedido(pedidoId, compradorId, 'x')).rejects.toThrow(PedidoCancelacionError);
        });
    });

    describe('getPedidosByUsuarioId', () => {
        test('Debe devolver el historial de pedidos del usuario', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: compradorId });
            mockPedidoRepository.getPedidosByCompradorId.mockResolvedValue([pedidoDominio()]);
            const result = await pedidoService.getPedidosByUsuarioId(compradorId);
            expect(result.status).toBe(200);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('getVentasDelVendedor', () => {
        test('Debe devolver los pedidos que incluyen productos del vendedor', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: vendedorId });
            mockProductoRepository.getIdsByVendedor.mockResolvedValue([productoId]);
            mockPedidoRepository.getPedidosByProductoIds.mockResolvedValue([pedidoDominio()]);
            const result = await pedidoService.getVentasDelVendedor(vendedorId);
            expect(result.status).toBe(200);
            expect(result.data).toHaveLength(1);
            expect(mockPedidoRepository.getPedidosByProductoIds).toHaveBeenCalledWith([productoId]);
        });

        test('Debe lanzar error si el vendedor no existe', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue(null);
            await expect(pedidoService.getVentasDelVendedor(vendedorId)).rejects.toThrow(UsuarioNoEncontradoError);
        });
    });
});
