class PedidoError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = this.constructor.name
        this.isOperational = true
    }
}

class PedidoValidacionError extends PedidoError {
    constructor(issues) {
        super(400, 'Error de validacion')
        this.issues = issues
    }
}

class PedidoNoEncontradoError extends PedidoError {
    constructor(id) {
        super(404, `No existe un pedido con ID ${id}.`);
    }
}

class PedidoCancelacionError extends PedidoError {
    constructor() {
        super(409, 'No se puede cancelar un pedido que ya fue enviado.')
    }
}

class PedidoEstadoInvalidoError extends PedidoError {
    constructor(message) {
        super(409, message || 'Transición de estado de pedido inválida.')
    }
}

export {
    PedidoError,
    PedidoValidacionError,
    PedidoNoEncontradoError,
    PedidoCancelacionError,
    PedidoEstadoInvalidoError
};
