import { CategoriaModel } from "../schemas/mongoose/categoriaSchema.js"
import { validarIdMongoose } from "../utils/idValidator.js"

export class CategoriaRepository {
    constructor() {
        this.model = CategoriaModel
    }

    _validateObjectId(id) {
        validarIdMongoose(id)
    }

    async getAllCategorias() {
        return await this.model.find()
    }

    async getCategoriaById(id) {
        this._validateObjectId(id)
        return await this.model.findById(id)
    }

    async getCategoriasByNombre(termino) {
        return await this.model.find({ nombre: { $regex: termino, $options: "i" } })
    }

    async createCategoria(categoria) {
        const nuevaCategoria = new this.model(categoria)
        return await nuevaCategoria.save()
    }

    async existsCategoria(nombre) {
        return await this.model.exists({ nombre })
    }

    async deleteCategoriaById(id) {
        this._validateObjectId(id)
        return await this.model.findByIdAndDelete(id)
    }
}
