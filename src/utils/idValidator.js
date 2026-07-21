import mongoose from "mongoose"

export function validarIdMongoose(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        const error = new Error(`ID inválido: "${id}" no es un identificador válido`)
        error.status = 400
        error.isOperational = true
        throw error
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error(`ID inválido: "${id}" no es un identificador válido`)
        error.status = 400
        error.isOperational = true
        throw error
    }

    return true
}
