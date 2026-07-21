import jwt from "jsonwebtoken"
import { UsuarioNoAutorizadoError } from "./authErrors.js"

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UsuarioNoAutorizadoError("Token no proporcionado")
        }

        const token = authHeader.slice(7)
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UsuarioNoAutorizadoError("Token inválido"))
        } else if (error instanceof UsuarioNoAutorizadoError) {
            next(error)
        } else {
            next(error)
        }
    }
}

export function requireRol(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return next(new UsuarioNoAutorizadoError("Usuario no autenticado"))
        }

        if (!rolesPermitidos.includes(req.usuario.tipo)) {
            return next(new UsuarioNoAutorizadoError("Acceso denegado: rol no autorizado"))
        }

        next()
    }
}
