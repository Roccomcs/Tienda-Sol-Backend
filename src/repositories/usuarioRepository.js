import { UsuarioModel } from "../schemas/mongoose/usuarioSchema.js"
import { validarIdMongoose } from "../utils/idValidator.js"
import bcrypt from "bcryptjs"

export class UsuarioRepository {
    constructor() {
        this.model = UsuarioModel
    }

    _validateObjectId(id) {
        validarIdMongoose(id)
    }

    async getAllUsuarios() {
        return await this.model.find({ activo: true })
    }

    async createUsuario(usuario) {
        const nuevoUsuario = new this.model(usuario);
        nuevoUsuario.password = await bcrypt.hash(nuevoUsuario.password, 10);
        return await nuevoUsuario.save();
    }

    async getUsuarioByEmail(email) {
        return await this.model.findOne({ email })
    }

    async getUsuarioById(id) {
        this._validateObjectId(id)
        return await this.model.findById(id)
    }

    async existsUsuario(email) {
        return await this.model.exists({ email })
    }

    async updateUsuarioById(id, infoActualizada) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(
            id,
            infoActualizada,
            { new: true }
        )
    }

    async deleteUsuarioById(id) {
        this._validateObjectId(id)
        return await this.model.findByIdAndUpdate(id,
            {
                activo: false,
                fechaBaja: new Date()
            },
            { new: true }
        )
    }
}
