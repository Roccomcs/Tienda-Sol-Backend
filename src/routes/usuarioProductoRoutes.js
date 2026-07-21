import express from 'express'
import { ProductoController } from "../controllers/productoController.js"

// Rutas anidadas: /usuarios/:id/productos (listado de productos de un vendedor)
const pathProductosDeVendedor = "/"

export default function usuarioProductoRoutes(getController) {
    const router = express.Router({ mergeParams: true })
    const controller = getController(ProductoController)

    router.get(pathProductosDeVendedor, (req, res, next) => controller.buscarProductosDeVendedor(req, res, next))

    return router
}
