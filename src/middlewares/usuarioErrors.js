class UsuarioError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = this.constructor.name
        this.isOperational = true
    }
}

class UsuarioValidacionError extends UsuarioError {
    constructor(issues) {
        super(400, 'Error de validacion')
        this.issues = issues
    }
}

class UsuarioYaExistenteError extends UsuarioError {
    constructor() {
        super(409, 'Ya existe un usuario con ese email.')
    }
}

class UsuarioNoEncontradoError extends UsuarioError {
    constructor(id) {
        super(404, `No existe un usuario con ID ${id}.`);
    }
}

export {
    UsuarioError,
    UsuarioValidacionError,
    UsuarioYaExistenteError,
    UsuarioNoEncontradoError
};
