import { textUsuario } from "./usuarioMapper.js"
import { textProducto } from "./productoMapper.js"

// DTO de un ítem del pedido
function textItemPedido(item) {
    return {
        producto: item.producto && (item.producto._id || item.producto.id)
            ? textProducto(item.producto)
            : (item.producto ?? null),
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad
    }
}

// DTO de un cambio de estado del historial
function textCambioEstado(cambio) {
    return {
        fecha: cambio.fecha,
        estado: cambio.estado,
        usuario: cambio.usuario && (cambio.usuario._id || cambio.usuario.id)
            ? textUsuario(cambio.usuario)
            : (cambio.usuario ?? null),
        motivo: cambio.motivo
    }
}

// DTO plano de un pedido
export function textPedido(pedido) {
    if (!pedido) return null
    return {
        id: pedido._id ?? pedido.id,
        comprador: pedido.comprador && (pedido.comprador._id || pedido.comprador.id)
            ? textUsuario(pedido.comprador)
            : (pedido.comprador ?? null),
        items: (pedido.items || []).map(item => textItemPedido(item)),
        total: pedido.total,
        moneda: pedido.moneda,
        direccionEntrega: pedido.direccionEntrega,
        estado: pedido.estado,
        fechaCreacion: pedido.fechaCreacion
    }
}

export function formatPedido(pedido) {
    return textPedido(pedido)
}

// DTO detallado con historial de estados
export function formatPedidoResumen(pedido) {
    return {
        ...textPedido(pedido),
        historialEstados: (pedido.historialEstados || []).map(cambio => textCambioEstado(cambio))
    }
}

export function formatPedidos(pedidos) {
    return (pedidos || []).map(pedido => textPedido(pedido))
}
