class CategoriaError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = this.constructor.name
        this.isOperational = true
    }
}

class CategoriaValidacionError extends CategoriaError {
    constructor(issues) {
        super(400, 'Error de validacion')
        this.issues = issues
    }
}

class CategoriaYaExistenteError extends CategoriaError {
    constructor() {
        super(409, 'Ya existe una categoria con ese nombre.')
    }
}

class CategoriaNoEncontradaError extends CategoriaError {
    constructor(id) {
        super(404, `No existe una categoria con ID ${id}.`);
    }
}

export {
    CategoriaError,
    CategoriaValidacionError,
    CategoriaYaExistenteError,
    CategoriaNoEncontradaError
};
