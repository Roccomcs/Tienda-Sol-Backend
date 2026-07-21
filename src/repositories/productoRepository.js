import { ProductoModel } from "../schemas/mongoose/productoSchema.js"
import { validarIdMongoose } from "../utils/idValidator.js"

// Traduce el criterio de orden recibido a la sintaxis de Mongoose
const ORDENES = {
    precioAsc: { precio: 1 },
    precioDesc: { precio: -1 },
    masVendido: { cantidadVendida: -1 }
}

export class ProductoRepository {
    constructor() {
        this.model = ProductoModel
    }

    _validateObjectId(id) {
        validarIdMongoose(id)
    }

    async getProductoById(id) {
        this._validateObjectId(id)
        return await this.model.findById(id)
            .populate('vendedor')
            .populate('categorias')
    }

    async createProducto(producto) {
        const nuevoProducto = new this.model(producto)
        await nuevoProducto.save()
        return await this.getProductoById(nuevoProducto._id.toString())
    }

    async updateProductoById(id, infoActualizada) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(
            id,
            infoActualizada,
            { returnDocument: 'after' }
        )
            .populate('vendedor')
            .populate('categorias')
    }

    async deleteProductoById(id) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        )
    }

    // Descuenta stock e incrementa la cantidad vendida de forma atómica
    async reducirStock(id, cantidad) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(
            id,
            { $inc: { stock: -cantidad, cantidadVendida: cantidad } },
            { new: true }
        )
    }

    // Repone stock y ajusta la cantidad vendida de forma atómica
    async aumentarStock(id, cantidad) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(
            id,
            { $inc: { stock: cantidad, cantidadVendida: -cantidad } },
            { new: true }
        )
    }

    // Devuelve los IDs de los productos publicados por un vendedor
    async getIdsByVendedor(vendedorId) {
        this._validateObjectId(vendedorId)
        return await this.model.find({ vendedor: vendedorId }).distinct('_id')
    }

    // Búsqueda de productos con filtros, orden y paginación.
    // vendedorId opcional (catálogo global si no se envía). categoriaId filtra por categoría (AND).
    // categoriaIds proviene del término de búsqueda por nombre de categoría (OR con titulo/descripcion).
    async buscarProductos({ vendedorId, q, precioMin, precioMax, categoriaIds, categoriaId, incluirInactivos = false, page = 1, limit = 10, orden }) {
        const filtro = {}

        if (vendedorId) {
            this._validateObjectId(vendedorId)
            filtro.vendedor = vendedorId
        }

        if (!incluirInactivos) {
            filtro.activo = true
        }

        if (q) {
            filtro.$or = [
                { titulo: { $regex: q, $options: "i" } },
                { descripcion: { $regex: q, $options: "i" } }
            ]
            if (categoriaIds && categoriaIds.length > 0) {
                filtro.$or.push({ categorias: { $in: categoriaIds } })
            }
        }

        if (categoriaId) {
            filtro.categorias = categoriaId
        }

        if (precioMin !== undefined || precioMax !== undefined) {
            filtro.precio = {}
            if (precioMin !== undefined) filtro.precio.$gte = precioMin
            if (precioMax !== undefined) filtro.precio.$lte = precioMax
        }

        const sort = ORDENES[orden] || { createdAt: -1 }
        const skip = (page - 1) * limit

        const [items, total] = await Promise.all([
            this.model.find(filtro)
                .populate('vendedor')
                .populate('categorias')
                .sort(sort)
                .skip(skip)
                .limit(limit),
            this.model.countDocuments(filtro)
        ])

        return { items, total }
    }
}
