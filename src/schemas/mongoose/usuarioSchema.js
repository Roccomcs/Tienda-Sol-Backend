import mongoose from "mongoose";
import { Usuario } from "../../models/Usuario.js"
import { TipoUsuario } from "../../models/enums/TipoUsuario.js"

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: Object.values(TipoUsuario),
        required: true
    },
    fechaAlta: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaBaja: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

usuarioSchema.loadClass(Usuario)

export const UsuarioModel = mongoose.model("Usuario", usuarioSchema, "usuarios");
