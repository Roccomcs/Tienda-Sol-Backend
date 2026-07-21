import { PedidoModel } from "../schemas/mongoose/pedidoSchema.js"
import { validarIdMongoose } from "../utils/idValidator.js"

export class PedidoRepository {
    constructor() {
        this.model = PedidoModel
    }

    _validateObjectId(id) {
        validarIdMongoose(id)
    }

    // Popula el pedido con comprador y los productos (y sus vendedores) de cada ítem
    _popularPedido(query) {
        return query
            .populate('comprador')
            .populate({
                path: 'items.producto',
                populate: { path: 'vendedor' }
            })
    }

    async getPedidoById(id) {
        this._validateObjectId(id)
        return await this._popularPedido(this.model.findById(id))
    }

    async createPedido(pedido) {
        const nuevoPedido = new this.model(pedido)
        await nuevoPedido.save()
        return await this.getPedidoById(nuevoPedido._id.toString())
    }

    async getPedidosByCompradorId(compradorId) {
        this._validateObjectId(compradorId)
        return await this._popularPedido(
            this.model.find({ comprador: compradorId }).sort({ fechaCreacion: -1 })
        )
    }

    async savePedido(pedido) {
        await pedido.save()
        return await this.getPedidoById(pedido._id.toString())
    }
}
