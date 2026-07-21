class ProductoError extends Error {
    constructor(status, message) {
        super(message)
        this.status = status
        this.name = this.constructor.name
        this.isOperational = true
    }
}

class ProductoValidacionError extends ProductoError {
    constructor(issues) {
        super(400, 'Error de validacion')
        this.issues = issues
    }
}

class ProductoNoEncontradoError extends ProductoError {
    constructor(id) {
        super(404, `No existe un producto con ID ${id}.`);
    }
}

class ProductoSinStockError extends ProductoError {
    constructor(titulo) {
        super(409, `Stock insuficiente para el producto ${titulo}.`);
    }
}

export {
    ProductoError,
    ProductoValidacionError,
    ProductoNoEncontradoError,
    ProductoSinStockError
};
