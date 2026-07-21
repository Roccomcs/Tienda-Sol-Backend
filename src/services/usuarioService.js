import * as usuarioMapper from "../mappers/usuarioMapper.js"
import { UsuarioNoEncontradoError } from "../middlewares/usuarioErrors.js"

export default class UsuarioService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository
    }

    async getAllUsuarios() {
        const usuarios = await this.usuarioRepository.getAllUsuarios()
        return {
            success: true,
            status: 200,
            data: usuarioMapper.formatUsuarios(usuarios)
        }
    }

    async getUsuarioById(id) {
        const usuario = await this.usuarioRepository.getUsuarioById(id)
        if (!usuario) {
            throw new UsuarioNoEncontradoError(id)
        }
        return {
            success: true,
            status: 200,
            data: usuarioMapper.formatUsuario(usuario)
        }
    }
}
