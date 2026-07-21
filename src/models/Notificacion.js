export class Notificacion {
    constructor({
        id,
        usuarioDestino,
        mensaje,
        fechaAlta = new Date(),
        leida = false,
        fechaLeida = null
    }) {
        this.id = id
        this.usuarioDestino = usuarioDestino
        this.mensaje = mensaje
        this.fechaAlta = fechaAlta
        this.leida = leida
        this.fechaLeida = fechaLeida
    }

    // Marca la notificación como leída registrando la fecha
    marcarComoLeida() {
        this.leida = true
        this.fechaLeida = new Date()
    }
}
