import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import * as authSchema from "../schemas/zod/authSchema.js"
import * as usuarioMapper from "../mappers/usuarioMapper.js"
import { UsuarioNoAutorizadoError } from "../middlewares/authErrors.js"
import { UsuarioValidacionError, UsuarioYaExistenteError } from "../middlewares/usuarioErrors.js"

export default class AuthService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository
    }

    generarToken(usuarioId, tipo) {
        const payload = {
            sub: usuarioId,
            tipo
        }
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        })
    }

    async register(payload) {
        const result = authSchema.registerSchema.safeParse(payload)
        if (!result.success) {
            throw new UsuarioValidacionError(result.error.issues)
        }

        const usuarioExiste = await this.usuarioRepository.existsUsuario(payload.email)
        if (usuarioExiste) {
            throw new UsuarioYaExistenteError()
        }

        const usuario = await this.usuarioRepository.createUsuario({
            nombre: payload.nombre,
            email: payload.email,
            telefono: payload.telefono ?? null,
            password: payload.password,
            tipo: payload.tipo
        })

        const accessToken = this.generarToken(usuario._id.toString(), usuario.tipo)

        return {
            success: true,
            status: 201,
            data: { accessToken, usuario: usuarioMapper.formatUsuario(usuario) }
        }
    }

    async login(payload) {
        const result = authSchema.loginSchema.safeParse(payload)
        if (!result.success) {
            throw new UsuarioValidacionError(result.error.issues)
        }

        const usuario = await this.usuarioRepository.getUsuarioByEmail(payload.email)
        if (!usuario) {
            throw new UsuarioNoAutorizadoError("Credenciales inválidas")
        }

        if (!usuario.activo) {
            throw new UsuarioNoAutorizadoError("Usuario inactivo")
        }

        const passwordValido = await bcrypt.compare(payload.password, usuario.password)
        if (!passwordValido) {
            throw new UsuarioNoAutorizadoError("Credenciales inválidas")
        }

        const accessToken = this.generarToken(usuario._id.toString(), usuario.tipo)

        return {
            success: true,
            status: 200,
            data: { accessToken, usuario: usuarioMapper.formatUsuario(usuario) }
        }
    }

    async logout() {
        // Al ser JWT stateless, el logout se resuelve descartando el token en el cliente
        return {
            success: true,
            status: 200,
            data: { message: "Sesión cerrada correctamente" }
        }
    }
}
