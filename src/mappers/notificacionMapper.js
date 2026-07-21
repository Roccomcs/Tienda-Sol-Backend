// DTO plano de una notificacion
export function textNotificacion(notificacion) {
    if (!notificacion) return null
    return {
        id: notificacion._id ?? notificacion.id,
        usuarioDestino: notificacion.usuarioDestino && (notificacion.usuarioDestino._id || notificacion.usuarioDestino.id)
            ? (notificacion.usuarioDestino._id ?? notificacion.usuarioDestino.id)
            : notificacion.usuarioDestino,
        mensaje: notificacion.mensaje,
        fechaAlta: notificacion.fechaAlta,
        leida: notificacion.leida,
        fechaLeida: notificacion.fechaLeida
    }
}

export function formatNotificacion(notificacion) {
    return textNotificacion(notificacion)
}

export function formatNotificaciones(notificaciones) {
    return (notificaciones || []).map(notificacion => textNotificacion(notificacion))
}
