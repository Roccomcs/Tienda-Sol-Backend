import express from 'express'
import { CategoriaController } from "../controllers/categoriaController.js"

const pathCategorias = "/"
const pathCategoriaById = "/:id"

export default function categoriaRoutes(getController) {
    const router = express.Router()
    const controller = getController(CategoriaController)

    router.get(pathCategorias, (req, res, next) => controller.getCategorias(req, res, next))
    router.get(pathCategoriaById, (req, res, next) => controller.getCategoriaById(req, res, next))
    router.post(pathCategorias, (req, res, next) => controller.createCategoria(req, res, next))
    router.delete(pathCategoriaById, (req, res, next) => controller.deleteCategoria(req, res, next))

    return router
}
