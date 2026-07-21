export class PedidoController {
    constructor(pedidoService) {
        this.pedidoService = pedidoService
    }

    async createPedido(req, res, next) {
        try {
            const compradorId = req.usuario.sub
            const result = await this.pedidoService.createPedido(compradorId, req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async marcarEnviado(req, res, next) {
        try {
            const vendedorId = req.usuario.sub
            const result = await this.pedidoService.marcarEnviado(req.params.id, vendedorId)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async cancelarPedido(req, res, next) {
        try {
            const compradorId = req.usuario.sub
            const motivo = req.body?.motivo
            const result = await this.pedidoService.cancelarPedido(req.params.id, compradorId, motivo)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    // GET /usuarios/:id/pedidos — historial de pedidos del usuario
    async getPedidosByUsuarioId(req, res, next) {
        try {
            const result = await this.pedidoService.getPedidosByUsuarioId(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    // GET /usuarios/:id/ventas — pedidos recibidos por el vendedor
    async getVentasDelVendedor(req, res, next) {
        try {
            const result = await this.pedidoService.getVentasDelVendedor(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
