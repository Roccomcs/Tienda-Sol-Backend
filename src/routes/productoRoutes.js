import express from 'express'
import { ProductoController } from "../controllers/productoController.js"
import { authMiddleware, requireRol } from "../middlewares/authMiddleware.js"
import { TipoUsuario } from "../models/enums/TipoUsuario.js"

const pathProductos = "/"
const pathProductoById = "/:id"

export default function productoRoutes(getController) {
    const router = express.Router()
    const controller = getController(ProductoController)

    router.get(pathProductoById, (req, res, next) => controller.getProductoById(req, res, next))
    router.post(pathProductos, authMiddleware, requireRol(TipoUsuario.VENDEDOR), (req, res, next) => controller.createProducto(req, res, next))
    router.put(pathProductoById, authMiddleware, requireRol(TipoUsuario.VENDEDOR), (req, res, next) => controller.updateProducto(req, res, next))
    router.delete(pathProductoById, authMiddleware, requireRol(TipoUsuario.VENDEDOR), (req, res, next) => controller.deleteProducto(req, res, next))

    return router
}
