export class AuthController {
    constructor(authService) {
        this.authService = authService
    }

    async register(req, res, next) {
        try {
            const result = await this.authService.register(req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async login(req, res, next) {
        try {
            const result = await this.authService.login(req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async logout(req, res, next) {
        try {
            const result = await this.authService.logout()
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
