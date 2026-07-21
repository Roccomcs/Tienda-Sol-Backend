import * as productoSchema from "../schemas/zod/productoSchema.js"
import * as productoMapper from "../mappers/productoMapper.js"
import { ProductoValidacionError, ProductoNoEncontradoError } from "../middlewares/productoErrors.js"
import { UsuarioNoEncontradoError } from "../middlewares/usuarioErrors.js"
import { UsuarioNoAutorizadoError } from "../middlewares/authErrors.js"

export default class ProductoService {
    constructor(productoRepository, usuarioRepository, categoriaRepository) {
        this.productoRepository = productoRepository
        this.usuarioRepository = usuarioRepository
        this.categoriaRepository = categoriaRepository
    }

    async getProductoById(id) {
        const producto = await this.productoRepository.getProductoById(id)
        if (!producto) {
            throw new ProductoNoEncontradoError(id)
        }
        return {
            success: true,
            status: 200,
            data: productoMapper.formatProducto(producto)
        }
    }

    async createProducto(vendedorId, payload) {
        const result = productoSchema.createProductoSchema.safeParse(payload)
        if (!result.success) {
            throw new ProductoValidacionError(result.error.issues)
        }

        const producto = await this.productoRepository.createProducto({
            vendedor: vendedorId,
            titulo: payload.titulo,
            descripcion: payload.descripcion ?? "",
            categorias: payload.categorias ?? [],
            precio: payload.precio,
            moneda: payload.moneda,
            stock: payload.stock,
            fotos: payload.fotos ?? []
        })

        return {
            success: true,
            status: 201,
            data: productoMapper.formatProducto(producto)
        }
    }

    async updateProductoById(id, vendedorId, payload) {
        const result = productoSchema.updateProductoSchema.safeParse(payload)
        if (!result.success) {
            throw new ProductoValidacionError(result.error.issues)
        }

        const producto = await this.productoRepository.getProductoById(id)
        if (!producto) {
            throw new ProductoNoEncontradoError(id)
        }
        this._validarPropietario(producto, vendedorId)

        const actualizado = await this.productoRepository.updateProductoById(id, payload)
        return {
            success: true,
            status: 200,
            data: productoMapper.formatProducto(actualizado)
        }
    }

    async deleteProductoById(id, vendedorId) {
        const producto = await this.productoRepository.getProductoById(id)
        if (!producto) {
            throw new ProductoNoEncontradoError(id)
        }
        this._validarPropietario(producto, vendedorId)

        await this.productoRepository.deleteProductoById(id)
        return {
            success: true,
            status: 200,
            data: productoMapper.formatProducto(producto)
        }
    }

    // Búsqueda global de productos (catálogo del marketplace) con filtros, orden y paginación
    async buscarProductos(filtros = {}) {
        return await this._buscar(filtros)
    }

    // Búsqueda de productos de un vendedor en particular (incluye inactivos si se solicita)
    async buscarProductosDeVendedor(vendedorId, filtros = {}) {
        const vendedor = await this.usuarioRepository.getUsuarioById(vendedorId)
        if (!vendedor) {
            throw new UsuarioNoEncontradoError(vendedorId)
        }
        return await this._buscar({ ...filtros, vendedorId })
    }

    // Lógica común de búsqueda: resuelve categorías por nombre y arma la página de resultados
    async _buscar({ vendedorId, q, precioMin, precioMax, categoria, incluirInactivos, page = 1, limit = 10, orden } = {}) {
        // Si hay término de búsqueda, se buscan las categorías cuyo nombre coincida
        let categoriaIds = []
        if (q) {
            const categorias = await this.categoriaRepository.getCategoriasByNombre(q)
            categoriaIds = categorias.map(cat => cat._id)
        }

        // Filtro explícito de categoría (por id o por nombre)
        let categoriaId
        if (categoria) {
            if (/^[0-9a-fA-F]{24}$/.test(categoria)) {
                categoriaId = categoria
            } else {
                const encontradas = await this.categoriaRepository.getCategoriasByNombre(categoria)
                categoriaId = encontradas[0]?._id
            }
        }

        const { items, total } = await this.productoRepository.buscarProductos({
            vendedorId,
            q,
            precioMin: precioMin !== undefined ? Number(precioMin) : undefined,
            precioMax: precioMax !== undefined ? Number(precioMax) : undefined,
            categoriaIds,
            categoriaId,
            incluirInactivos: incluirInactivos === true || incluirInactivos === 'true',
            page: Number(page),
            limit: Number(limit),
            orden
        })

        return {
            success: true,
            status: 200,
            data: productoMapper.formatProductosPaginados({
                items,
                total,
                page: Number(page),
                limit: Number(limit)
            })
        }
    }

    // Valida que el vendedor autenticado sea el dueño del producto
    _validarPropietario(producto, vendedorId) {
        const idDueño = producto.vendedor?._id?.toString() || producto.vendedor?.toString()
        if (idDueño !== String(vendedorId)) {
            throw new UsuarioNoAutorizadoError("No podés modificar un producto de otro vendedor")
        }
    }
}
