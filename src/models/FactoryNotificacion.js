import { EstadoPedido } from "./enums/EstadoPedido.js"

// Extrae el id de un usuario ya sea que venga como string, ObjectId o documento poblado
const extraerIdUsuario = (usuario) => {
    if (!usuario) return null
    if (typeof usuario === "string") return usuario
    if (usuario._id) return typeof usuario._id === "string" ? usuario._id : usuario._id.toString()
    if (usuario.id) return typeof usuario.id === "string" ? usuario.id : usuario.id.toString()
    return null
}

const nombreUsuario = (usuario) => usuario?.nombre || "un usuario"

// Arma el detalle de la dirección de entrega en una sola línea
const formatearDireccion = (direccion) => {
    if (!direccion) return "sin dirección"
    const partes = [direccion.calle, direccion.altura, direccion.ciudad, direccion.provincia, direccion.pais]
    return partes.filter(Boolean).join(", ")
}

// Arma el detalle de los productos incluidos en el pedido
const formatearItems = (items = []) => {
    return items
        .map(item => `${item.cantidad}x ${item.producto?.titulo || "producto"}`)
        .join(", ")
}

// Agrupa los ítems por vendedor para notificar a cada uno
const vendedoresDelPedido = (items = []) => {
    const vendedores = new Map()
    items.forEach(item => {
        const vendedor = item.producto?.vendedor
        const idVendedor = extraerIdUsuario(vendedor)
        if (idVendedor && !vendedores.has(idVendedor)) {
            vendedores.set(idVendedor, vendedor)
        }
    })
    return vendedores
}

const handlers = {
    // Cada vez que se realiza un pedido, se notifica al vendedor
    [EstadoPedido.PENDIENTE]: (pedido) => {
        const payloads = []
        const compradorNombre = nombreUsuario(pedido.comprador)
        const detalleItems = formatearItems(pedido.items)
        const direccion = formatearDireccion(pedido.direccionEntrega)

        vendedoresDelPedido(pedido.items).forEach((_vendedor, idVendedor) => {
            payloads.push({
                usuarioDestino: idVendedor,
                mensaje: `Nuevo pedido de ${compradorNombre}. Productos: ${detalleItems}. Total: ${pedido.total} ${pedido.moneda}. Enviar a: ${direccion}.`,
                leida: false
            })
        })
        return payloads
    },
    // Cuando el vendedor marca el pedido como enviado, se notifica al comprador
    [EstadoPedido.ENVIADO]: (pedido) => {
        const payloads = []
        const idComprador = extraerIdUsuario(pedido.comprador)
        if (idComprador) {
            payloads.push({
                usuarioDestino: idComprador,
                mensaje: `Tu pedido fue enviado. Productos: ${formatearItems(pedido.items)}.`,
                leida: false
            })
        }
        return payloads
    },
    // Cuando el comprador cancela el pedido, se notifica al vendedor
    [EstadoPedido.CANCELADO]: (pedido) => {
        const payloads = []
        const compradorNombre = nombreUsuario(pedido.comprador)
        vendedoresDelPedido(pedido.items).forEach((_vendedor, idVendedor) => {
            payloads.push({
                usuarioDestino: idVendedor,
                mensaje: `El comprador ${compradorNombre} canceló un pedido que incluía: ${formatearItems(pedido.items)}.`,
                leida: false
            })
        })
        return payloads
    }
}

// Mensajes base según el estado del pedido
const MENSAJES_POR_ESTADO = Object.freeze({
    [EstadoPedido.PENDIENTE]: "Se ha realizado un nuevo pedido.",
    [EstadoPedido.ENVIADO]: "Tu pedido fue enviado.",
    [EstadoPedido.ENTREGADO]: "Tu pedido fue entregado.",
    [EstadoPedido.CANCELADO]: "Se ha cancelado un pedido."
})

export class FactoryNotificacion {
    // Devuelve el mensaje base correspondiente a un estado de pedido
    crearSegunEstadoPedido(estado) {
        return MENSAJES_POR_ESTADO[estado] || "Actualización de tu pedido."
    }

    // Genera los payloads de notificación que corresponden según el estado actual del pedido
    crearSegunPedido(pedido) {
        const creator = handlers[pedido?.estado]
        if (!creator || !pedido) return []
        return creator(pedido)
    }
}
