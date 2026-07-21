export class ProductoController {
    constructor(productoService) {
        this.productoService = productoService
    }

    async getProductoById(req, res, next) {
        try {
            const result = await this.productoService.getProductoById(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async createProducto(req, res, next) {
        try {
            const vendedorId = req.usuario.sub
            const result = await this.productoService.createProducto(vendedorId, req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async updateProducto(req, res, next) {
        try {
            const vendedorId = req.usuario.sub
            const result = await this.productoService.updateProductoById(req.params.id, vendedorId, req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async deleteProducto(req, res, next) {
        try {
            const vendedorId = req.usuario.sub
            const result = await this.productoService.deleteProductoById(req.params.id, vendedorId)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    // GET /usuarios/:id/productos — búsqueda de productos de un vendedor con filtros
    async buscarProductosDeVendedor(req, res, next) {
        try {
            const vendedorId = req.params.id
            const filtros = {
                q: req.query.q,
                precioMin: req.query.precioMin,
                precioMax: req.query.precioMax,
                page: req.query.page,
                limit: req.query.limit,
                orden: req.query.orden
            }
            const result = await this.productoService.buscarProductosDeVendedor(vendedorId, filtros)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
