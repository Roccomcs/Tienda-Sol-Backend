class UsuarioNoAutorizadoError extends Error {
    constructor(message = "Usuario no autorizado") {
        super(message);
        this.status = 401;
        this.name = this.constructor.name;
        this.isOperational = true;
    }
}

export { UsuarioNoAutorizadoError };
