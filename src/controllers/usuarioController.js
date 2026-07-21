export class UsuarioController {
    constructor(usuarioService) {
        this.usuarioService = usuarioService
    }

    async getUsuarios(_req, res, next) {
        try {
            const result = await this.usuarioService.getAllUsuarios()
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async getUsuarioById(req, res, next) {
        try {
            const result = await this.usuarioService.getUsuarioById(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
