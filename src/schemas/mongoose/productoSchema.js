import mongoose from "mongoose";
import { Producto } from "../../models/Producto.js"
import { Moneda } from "../../models/enums/Moneda.js"

const productoSchema = new mongoose.Schema({
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: "",
        trim: true
    },
    categorias: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Categoria"
    }],
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: Object.values(Moneda),
        default: Moneda.ARS
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    fotos: [{
        type: String
    }],
    activo: {
        type: Boolean,
        default: true
    },
    cantidadVendida: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    versionKey: false
})

productoSchema.loadClass(Producto)

export const ProductoModel = mongoose.model("Producto", productoSchema, "productos")
