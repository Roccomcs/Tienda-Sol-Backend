export class NotificacionController {
    constructor(notificacionService) {
        this.notificacionService = notificacionService
    }

    // GET /usuarios/:usuarioId/notificaciones?leida=true|false
    async getAllNotificacionesByUsuarioId(req, res, next) {
        try {
            const usuarioId = req.params.usuarioId
            const leida = req.query.leida
            const result = await this.notificacionService.getNotificacionesByUsuarioId(usuarioId, leida)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    // PATCH /usuarios/:usuarioId/notificaciones/:notificacionId
    async marcarNotificacionLeida(req, res, next) {
        try {
            const usuarioId = req.params.usuarioId
            const notificacionId = req.params.notificacionId
            const result = await this.notificacionService.marcarNotificacionLeida(usuarioId, notificacionId)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
