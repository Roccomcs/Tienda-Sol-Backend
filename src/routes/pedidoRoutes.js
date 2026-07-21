import express from 'express'
import { PedidoController } from "../controllers/pedidoController.js"
import { authMiddleware, requireRol } from "../middlewares/authMiddleware.js"
import { TipoUsuario } from "../models/enums/TipoUsuario.js"

const pathPedidos = "/"
const pathEnviarPedido = "/:id/enviar"
const pathCancelarPedido = "/:id/cancelar"

export default function pedidoRoutes(getController) {
    const router = express.Router()
    const controller = getController(PedidoController)

    router.post(pathPedidos, authMiddleware, requireRol(TipoUsuario.COMPRADOR), (req, res, next) => controller.createPedido(req, res, next))
    router.patch(pathEnviarPedido, authMiddleware, requireRol(TipoUsuario.VENDEDOR), (req, res, next) => controller.marcarEnviado(req, res, next))
    router.patch(pathCancelarPedido, authMiddleware, requireRol(TipoUsuario.COMPRADOR), (req, res, next) => controller.cancelarPedido(req, res, next))

    return router
}
