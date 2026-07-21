import express from 'express'
import { PedidoController } from "../controllers/pedidoController.js"

// Rutas anidadas: /usuarios/:id/ventas (pedidos recibidos por un vendedor)
const pathVentasDeUsuario = "/"

export default function usuarioVentaRoutes(getController) {
    const router = express.Router({ mergeParams: true })
    const controller = getController(PedidoController)

    router.get(pathVentasDeUsuario, (req, res, next) => controller.getVentasDelVendedor(req, res, next))

    return router
}
