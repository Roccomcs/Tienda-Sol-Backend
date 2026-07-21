import express from 'express'
import { UsuarioController } from "../controllers/usuarioController.js"

const pathUsuarios = "/"
const pathUsuarioById = "/:id"

export default function usuarioRoutes(getController) {
    const router = express.Router()
    const controller = getController(UsuarioController)

    router.get(pathUsuarios, (req, res, next) => controller.getUsuarios(req, res, next))
    router.get(pathUsuarioById, (req, res, next) => controller.getUsuarioById(req, res, next))

    return router
}
