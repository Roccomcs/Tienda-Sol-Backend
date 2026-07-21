import mongoose from "mongoose";
import { Pedido } from "../../models/Pedido.js"
import { ItemPedido } from "../../models/ItemPedido.js"
import { DireccionEntrega } from "../../models/DireccionEntrega.js"
import { CambioEstadoPedido } from "../../models/CambioEstadoPedido.js"
import { EstadoPedido } from "../../models/enums/EstadoPedido.js"
import { Moneda } from "../../models/enums/Moneda.js"

// Subdocumento embebido: ítem del pedido
const itemPedidoSchema = new mongoose.Schema({
    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    precioUnitario: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: false })
itemPedidoSchema.loadClass(ItemPedido)

// Subdocumento embebido: dirección de entrega
const direccionEntregaSchema = new mongoose.Schema({
    calle: { type: String, required: true, trim: true },
    altura: { type: String, trim: true },
    piso: { type: String, default: null, trim: true },
    departamento: { type: String, default: null, trim: true },
    codigoPostal: { type: String, trim: true },
    ciudad: { type: String, trim: true },
    provincia: { type: String, trim: true },
    pais: { type: String, trim: true },
    lat: { type: String, default: null },
    lon: { type: String, default: null }
}, { _id: false })
direccionEntregaSchema.loadClass(DireccionEntrega)

// Subdocumento embebido: cambio de estado del historial
const cambioEstadoPedidoSchema = new mongoose.Schema({
    fecha: { type: Date, default: Date.now },
    estado: { type: String, enum: Object.values(EstadoPedido), required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", default: null },
    motivo: { type: String, default: null }
}, { _id: false })
cambioEstadoPedidoSchema.loadClass(CambioEstadoPedido)

const pedidoSchema = new mongoose.Schema({
    comprador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    items: {
        type: [itemPedidoSchema],
        default: []
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    moneda: {
        type: String,
        enum: Object.values(Moneda),
        default: Moneda.ARS
    },
    direccionEntrega: {
        type: direccionEntregaSchema,
        required: true
    },
    estado: {
        type: String,
        enum: Object.values(EstadoPedido),
        default: EstadoPedido.PENDIENTE
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    historialEstados: {
        type: [cambioEstadoPedidoSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
})

pedidoSchema.loadClass(Pedido)

export const PedidoModel = mongoose.model("Pedido", pedidoSchema, "pedidos")
