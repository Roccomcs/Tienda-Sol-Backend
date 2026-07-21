import { EstadoPedido } from "./enums/EstadoPedido.js"
import { CambioEstadoPedido } from "./CambioEstadoPedido.js"

// Transiciones de estado permitidas para un pedido
const TRANSICIONES_VALIDAS = Object.freeze({
    [EstadoPedido.PENDIENTE]: [EstadoPedido.ENVIADO, EstadoPedido.CANCELADO],
    [EstadoPedido.ENVIADO]: [EstadoPedido.ENTREGADO],
    [EstadoPedido.ENTREGADO]: [],
    [EstadoPedido.CANCELADO]: []
})

export class Pedido {
    constructor({
        id,
        comprador,
        items = [],
        moneda,
        direccionEntrega,
        estado = EstadoPedido.PENDIENTE,
        fechaCreacion = new Date(),
        historialEstados = [],
        total
    }) {
        this.id = id
        this.comprador = comprador
        this.items = items
        this.moneda = moneda
        this.direccionEntrega = direccionEntrega
        this.estado = estado
        this.fechaCreacion = fechaCreacion
        this.historialEstados = Array.isArray(historialEstados) ? historialEstados : []
        this.total = total ?? this.calcularTotal()
    }

    // Suma el subtotal de todos los ítems del pedido
    calcularTotal() {
        return (this.items || []).reduce((acumulado, item) => {
            const subtotal = typeof item.subtotal === "function"
                ? item.subtotal()
                : item.precioUnitario * item.cantidad
            return acumulado + subtotal
        }, 0)
    }

    // Cambia el estado validando la transición y registrando el cambio en el historial
    actualizarEstado(nuevoEstado, quien = null, motivo = null) {
        if (!Object.values(EstadoPedido).includes(nuevoEstado)) {
            throw new Error(`Estado de pedido inválido: ${nuevoEstado}`)
        }

        const transicionesPermitidas = TRANSICIONES_VALIDAS[this.estado] || []
        if (!transicionesPermitidas.includes(nuevoEstado)) {
            throw new Error(`No se puede pasar de ${this.estado} a ${nuevoEstado}`)
        }

        this.estado = nuevoEstado

        const cambio = new CambioEstadoPedido(new Date(), nuevoEstado, quien, motivo)
        this.historialEstados.push(cambio)
    }

    // Valida que todos los ítems tengan stock disponible
    validarStock() {
        return (this.items || []).every(item => {
            const producto = item.producto
            if (!producto || typeof producto.estaDisponible !== "function") {
                return false
            }
            return producto.estaDisponible(item.cantidad)
        })
    }
}
