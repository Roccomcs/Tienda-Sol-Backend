import * as notificacionMapper from "../mappers/notificacionMapper.js"
import { NotificacionNoEncontradaError } from "../middlewares/notificacionErrors.js"
import { FactoryNotificacion } from "../models/FactoryNotificacion.js"

export default class NotificacionService {
    constructor(notificacionRepository) {
        this.notificacionRepository = notificacionRepository
        this.factoryNotificacion = new FactoryNotificacion()
    }

    // Genera y persiste las notificaciones que correspondan según el estado del pedido
    async crearNotificacionesPorPedido(pedido) {
        const payloads = this.factoryNotificacion.crearSegunPedido(pedido)
        if (!payloads.length) return []
        return await Promise.all(
            payloads.map(payload => this.notificacionRepository.createNotificacion(payload))
        )
    }

    async getNotificacionesByUsuarioId(usuarioId, leida) {
        const notificaciones = await this.notificacionRepository.getNotificacionesByUsuarioId(usuarioId, leida)
        return {
            success: true,
            status: 200,
            data: notificacionMapper.formatNotificaciones(notificaciones)
        }
    }

    async marcarNotificacionLeida(usuarioId, notificacionId) {
        const notificacion = await this.notificacionRepository.getNotificacionById(notificacionId)
        if (!notificacion) {
            throw new NotificacionNoEncontradaError(notificacionId)
        }
        const actualizada = await this.notificacionRepository.marcarComoLeida(notificacionId)
        return {
            success: true,
            status: 200,
            data: notificacionMapper.formatNotificacion(actualizada)
        }
    }
}
