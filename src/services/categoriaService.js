import * as categoriaSchema from "../schemas/zod/categoriaSchema.js"
import * as categoriaMapper from "../mappers/categoriaMapper.js"
import { CategoriaValidacionError, CategoriaYaExistenteError, CategoriaNoEncontradaError } from "../middlewares/categoriaErrors.js"

export default class CategoriaService {
    constructor(categoriaRepository) {
        this.categoriaRepository = categoriaRepository
    }

    async getAllCategorias() {
        const categorias = await this.categoriaRepository.getAllCategorias()
        return {
            success: true,
            status: 200,
            data: categoriaMapper.formatCategorias(categorias)
        }
    }

    async getCategoriaById(id) {
        const categoria = await this.categoriaRepository.getCategoriaById(id)
        if (!categoria) {
            throw new CategoriaNoEncontradaError(id)
        }
        return {
            success: true,
            status: 200,
            data: categoriaMapper.formatCategoria(categoria)
        }
    }

    async createCategoria(payload) {
        const result = categoriaSchema.createCategoriaSchema.safeParse(payload)
        if (!result.success) {
            throw new CategoriaValidacionError(result.error.issues)
        }

        const existe = await this.categoriaRepository.existsCategoria(payload.nombre)
        if (existe) {
            throw new CategoriaYaExistenteError()
        }

        const categoria = await this.categoriaRepository.createCategoria({ nombre: payload.nombre })
        return {
            success: true,
            status: 201,
            data: categoriaMapper.formatCategoria(categoria)
        }
    }

    async deleteCategoriaById(id) {
        const categoria = await this.categoriaRepository.getCategoriaById(id)
        if (!categoria) {
            throw new CategoriaNoEncontradaError(id)
        }
        await this.categoriaRepository.deleteCategoriaById(id)
        return {
            success: true,
            status: 200,
            data: categoriaMapper.formatCategoria(categoria)
        }
    }
}
