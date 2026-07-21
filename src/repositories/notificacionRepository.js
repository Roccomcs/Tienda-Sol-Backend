import { NotificacionModel } from "../schemas/mongoose/notificacionSchema.js"
import { validarIdMongoose } from "../utils/idValidator.js"

export class NotificacionRepository {
    constructor() {
        this.model = NotificacionModel
    }

    _validateObjectId(id) {
        validarIdMongoose(id)
    }

    async createNotificacion(notificacion) {
        const nueva = new this.model(notificacion)
        return await nueva.save()
    }

    async getNotificacionesByUsuarioId(usuarioId, leida) {
        this._validateObjectId(usuarioId)
        const filtro = { usuarioDestino: usuarioId }
        if (leida !== undefined && leida !== null) {
            filtro.leida = leida === 'true' || leida === true
        }
        return await this.model.find(filtro).sort({ fechaAlta: -1 })
    }

    async getNotificacionById(notificacionId) {
        this._validateObjectId(notificacionId)
        return await this.model.findById(notificacionId)
    }

    async marcarComoLeida(notificacionId) {
        this._validateObjectId(notificacionId)
        return await this.model.findByIdAndUpdate(
            notificacionId,
            { $set: { leida: true, fechaLeida: new Date() } },
            { new: true }
        )
    }
}
