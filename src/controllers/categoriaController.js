export class CategoriaController {
    constructor(categoriaService) {
        this.categoriaService = categoriaService
    }

    async getCategorias(_req, res, next) {
        try {
            const result = await this.categoriaService.getAllCategorias()
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async getCategoriaById(req, res, next) {
        try {
            const result = await this.categoriaService.getCategoriaById(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async createCategoria(req, res, next) {
        try {
            const result = await this.categoriaService.createCategoria(req.body || {})
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }

    async deleteCategoria(req, res, next) {
        try {
            const result = await this.categoriaService.deleteCategoriaById(req.params.id)
            return res.status(result.status).json(result.data)
        } catch (error) {
            next(error)
        }
    }
}
