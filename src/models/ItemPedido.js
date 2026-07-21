export class ItemPedido {
    constructor(producto, cantidad, precioUnitario) {
        this.producto = producto
        this.cantidad = cantidad
        this.precioUnitario = precioUnitario
    }

    // Total de la línea del pedido (precio unitario por cantidad)
    subtotal() {
        return this.precioUnitario * this.cantidad
    }
}
