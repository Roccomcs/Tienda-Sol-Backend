import express from 'express'
import { PedidoController } from "../controllers/pedidoController.js"

// Rutas anidadas: /usuarios/:id/pedidos (historial de pedidos de un usuario)
const pathPedidosDeUsuario = "/"

export default function usuarioPedidoRoutes(getController) {
    const router = express.Router({ mergeParams: true })
    const controller = getController(PedidoController)

    router.get(pathPedidosDeUsuario, (req, res, next) => controller.getPedidosByUsuarioId(req, res, next))

    return router
}
