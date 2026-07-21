class NotificacionError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = this.constructor.name
        this.isOperational = true
    }
}

class NotificacionNoEncontradaError extends NotificacionError {
    constructor(id) {
        super(404, `No existe una notificacion con ID ${id}.`);
    }
}

export {
    NotificacionError,
    NotificacionNoEncontradaError
};
