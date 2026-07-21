export class Producto {
    constructor({
        id,
        vendedor,
        titulo,
        descripcion,
        categorias = [],
        precio,
        moneda,
        stock = 0,
        fotos = [],
        activo = true,
        cantidadVendida = 0
    }) {
        this.id = id
        this.vendedor = vendedor
        this.titulo = titulo
        this.descripcion = descripcion
        this.categorias = categorias
        this.precio = precio
        this.moneda = moneda
        this.stock = stock
        this.fotos = fotos
        this.activo = activo
        this.cantidadVendida = cantidadVendida
    }

    // Indica si el producto está activo y tiene stock suficiente para la cantidad pedida
    estaDisponible(cantidad) {
        return this.activo === true && this.stock >= cantidad
    }

    // Descuenta stock validando disponibilidad
    reducirStock(cantidad) {
        if (!this.estaDisponible(cantidad)) {
            throw new Error(`Stock insuficiente para el producto ${this.titulo}`)
        }
        this.stock -= cantidad
        this.cantidadVendida += cantidad
    }

    // Repone stock (por ejemplo, al cancelar un pedido)
    aumentarStock(cantidad) {
        this.stock += cantidad
        this.cantidadVendida = Math.max(0, this.cantidadVendida - cantidad)
    }
}
