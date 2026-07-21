import express from 'express'
import { NotificacionController } from "../controllers/notificacionController.js"

const pathNotificacionesByUsuarioId = "/"
const pathMarcarNotificacionLeida = "/:notificacionId"

export default function notificacionRoutes(getController) {
    const router = express.Router({ mergeParams: true })
    const controller = getController(NotificacionController)

    router.get(pathNotificacionesByUsuarioId, (req, res, next) => controller.getAllNotificacionesByUsuarioId(req, res, next))
    router.patch(pathMarcarNotificacionLeida, (req, res, next) => controller.marcarNotificacionLeida(req, res, next))

    return router
}
