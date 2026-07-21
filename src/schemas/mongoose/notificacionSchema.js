import mongoose from "mongoose"
import { Notificacion } from "../../models/Notificacion.js"

const notificacionSchema = new mongoose.Schema({
    usuarioDestino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    mensaje: {
        type: String,
        required: true,
        trim: true
    },
    fechaAlta: {
        type: Date,
        required: true,
        default: Date.now
    },
    leida: {
        type: Boolean,
        required: true,
        default: false
    },
    fechaLeida: {
        type: Date,
        default: null
    }
}, {
    versionKey: false
})

notificacionSchema.loadClass(Notificacion)

export const NotificacionModel = mongoose.model("Notificacion", notificacionSchema, "notificaciones")
