import * as pedidoSchema from "../schemas/zod/pedidoSchema.js"
import * as pedidoMapper from "../mappers/pedidoMapper.js"
import { EstadoPedido } from "../models/enums/EstadoPedido.js"
import { CambioEstadoPedido } from "../models/CambioEstadoPedido.js"
import {
    PedidoValidacionError,
    PedidoNoEncontradoError,
    PedidoCancelacionError,
    PedidoEstadoInvalidoError
} from "../middlewares/pedidoErrors.js"
import { ProductoNoEncontradoError, ProductoSinStockError } from "../middlewares/productoErrors.js"
import { UsuarioNoEncontradoError } from "../middlewares/usuarioErrors.js"
import { UsuarioNoAutorizadoError } from "../middlewares/authErrors.js"

export default class PedidoService {
    constructor(pedidoRepository, productoRepository, usuarioRepository, notificacionService) {
        this.pedidoRepository = pedidoRepository
        this.productoRepository = productoRepository
        this.usuarioRepository = usuarioRepository
        this.notificacionService = notificacionService
    }

    // Creación de un pedido: valida stock, calcula total, reduce stock y notifica al vendedor
    async createPedido(compradorId, payload) {
        const result = pedidoSchema.createPedidoSchema.safeParse(payload)
        if (!result.success) {
            throw new PedidoValidacionError(result.error.issues)
        }

        const comprador = await this.usuarioRepository.getUsuarioById(compradorId)
        if (!comprador) {
            throw new UsuarioNoEncontradoError(compradorId)
        }

        // Validar cada ítem contra su producto y armar los ítems del pedido
        const items = []
        let moneda = null
        for (const itemPayload of payload.items) {
            const producto = await this.productoRepository.getProductoById(itemPayload.productoId)
            if (!producto) {
                throw new ProductoNoEncontradoError(itemPayload.productoId)
            }
            if (!producto.estaDisponible(itemPayload.cantidad)) {
                throw new ProductoSinStockError(producto.titulo)
            }
            moneda = moneda ?? producto.moneda
            items.push({
                producto: producto._id,
                cantidad: itemPayload.cantidad,
                precioUnitario: producto.precio
            })
        }

        const total = items.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0)

        const pedidoCreado = await this.pedidoRepository.createPedido({
            comprador: compradorId,
            items,
            total,
            moneda,
            direccionEntrega: payload.direccionEntrega,
            estado: EstadoPedido.PENDIENTE,
            fechaCreacion: new Date(),
            historialEstados: [new CambioEstadoPedido(new Date(), EstadoPedido.PENDIENTE, compradorId, "Pedido creado")]
        })

        // Reducir el stock de cada producto vendido
        for (const item of items) {
            await this.productoRepository.reducirStock(item.producto.toString(), item.cantidad)
        }

        // Notificar al vendedor sobre el nuevo pedido
        await this.notificacionService.crearNotificacionesPorPedido(pedidoCreado)

        return {
            success: true,
            status: 201,
            data: pedidoMapper.formatPedidoResumen(pedidoCreado)
        }
    }

    // Marcar un pedido como enviado (rol vendedor): notifica al comprador
    async marcarEnviado(pedidoId, vendedorId) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId)
        if (!pedido) {
            throw new PedidoNoEncontradoError(pedidoId)
        }
        this._validarVendedorDelPedido(pedido, vendedorId)

        if (pedido.estado !== EstadoPedido.PENDIENTE) {
            throw new PedidoEstadoInvalidoError("Solo se puede enviar un pedido pendiente.")
        }

        pedido.actualizarEstado(EstadoPedido.ENVIADO, vendedorId, "Pedido enviado por el vendedor")
        const pedidoActualizado = await this.pedidoRepository.savePedido(pedido)

        await this.notificacionService.crearNotificacionesPorPedido(pedidoActualizado)

        return {
            success: true,
            status: 200,
            data: pedidoMapper.formatPedidoResumen(pedidoActualizado)
        }
    }

    // Cancelar un pedido antes de que sea enviado (rol comprador): repone stock y notifica al vendedor
    async cancelarPedido(pedidoId, compradorId, motivo) {
        const pedido = await this.pedidoRepository.getPedidoById(pedidoId)
        if (!pedido) {
            throw new PedidoNoEncontradoError(pedidoId)
        }
        this._validarComprador(pedido, compradorId)

        if (pedido.estado !== EstadoPedido.PENDIENTE) {
            throw new PedidoCancelacionError()
        }

        pedido.actualizarEstado(EstadoPedido.CANCELADO, compradorId, motivo || "Pedido cancelado por el comprador")
        const pedidoActualizado = await this.pedidoRepository.savePedido(pedido)

        // Reponer el stock de cada producto
        for (const item of pedido.items) {
            const productoId = item.producto?._id?.toString() || item.producto?.toString()
            await this.productoRepository.aumentarStock(productoId, item.cantidad)
        }

        await this.notificacionService.crearNotificacionesPorPedido(pedidoActualizado)

        return {
            success: true,
            status: 200,
            data: pedidoMapper.formatPedidoResumen(pedidoActualizado)
        }
    }

    // Historial de pedidos de un usuario (comprador)
    async getPedidosByUsuarioId(usuarioId) {
        const usuario = await this.usuarioRepository.getUsuarioById(usuarioId)
        if (!usuario) {
            throw new UsuarioNoEncontradoError(usuarioId)
        }
        const pedidos = await this.pedidoRepository.getPedidosByCompradorId(usuarioId)
        return {
            success: true,
            status: 200,
            data: pedidoMapper.formatPedidos(pedidos)
        }
    }

    // Valida que el comprador autenticado sea el dueño del pedido
    _validarComprador(pedido, compradorId) {
        const idComprador = pedido.comprador?._id?.toString() || pedido.comprador?.toString()
        if (idComprador !== String(compradorId)) {
            throw new UsuarioNoAutorizadoError("No podés operar sobre un pedido de otro comprador")
        }
    }

    // Valida que el vendedor autenticado tenga productos en el pedido
    _validarVendedorDelPedido(pedido, vendedorId) {
        const esVendedor = (pedido.items || []).some(item => {
            const idVendedor = item.producto?.vendedor?._id?.toString()
                || item.producto?.vendedor?.toString()
            return idVendedor === String(vendedorId)
        })
        if (!esVendedor) {
            throw new UsuarioNoAutorizadoError("No podés operar sobre un pedido que no incluye tus productos")
        }
    }
}
