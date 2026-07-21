import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

import { UsuarioModel } from "../schemas/mongoose/usuarioSchema.js";
import { CategoriaModel } from "../schemas/mongoose/categoriaSchema.js";
import { ProductoModel } from "../schemas/mongoose/productoSchema.js";
import { TipoUsuario } from "../models/enums/TipoUsuario.js";
import { Moneda } from "../models/enums/Moneda.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const URL = process.env.MONGODB_CONNECTION_STRING
    ?? (process.env.MONGODB_URI && process.env.MONGODB_DB_NAME
        ? `${process.env.MONGODB_URI}/${process.env.MONGODB_DB_NAME}`
        : "mongodb://localhost:27017/tienda-sol");

async function seed() {
    try {
        await mongoose.connect(URL);
        console.log("Conectado a MongoDB para seed.");

        const passHash = await bcrypt.hash("password123", 10);

        // Vendedor de ejemplo
        const vendedor = await UsuarioModel.findOneAndUpdate(
            { email: "ana@tiendasol.com" },
            { nombre: "Ana Vendedora", telefono: "1122334455", password: passHash, tipo: TipoUsuario.VENDEDOR, activo: true },
            { upsert: true, returnDocument: "after" }
        );

        // Comprador de ejemplo
        await UsuarioModel.findOneAndUpdate(
            { email: "carlos@tiendasol.com" },
            { nombre: "Carlos Comprador", telefono: "1199887766", password: passHash, tipo: TipoUsuario.COMPRADOR, activo: true },
            { upsert: true, returnDocument: "after" }
        );

        // Categorías de ejemplo
        const nombresCategorias = ["Electrónica", "Hogar", "Indumentaria", "Deportes"];
        const categorias = {};
        for (const nombre of nombresCategorias) {
            const categoria = await CategoriaModel.findOneAndUpdate(
                { nombre },
                { nombre },
                { upsert: true, returnDocument: "after" }
            );
            categorias[nombre] = categoria;
        }

        // Productos de ejemplo del vendedor
        const productosSeed = [
            { titulo: "Auriculares Bluetooth", descripcion: "Auriculares inalámbricos con cancelación de ruido", categorias: [categorias["Electrónica"]._id], precio: 19999.99, stock: 50, cantidadVendida: 12 },
            { titulo: "Teclado mecánico", descripcion: "Teclado retroiluminado switches azules", categorias: [categorias["Electrónica"]._id], precio: 34999.5, stock: 20, cantidadVendida: 30 },
            { titulo: "Cafetera de filtro", descripcion: "Cafetera para 12 tazas", categorias: [categorias["Hogar"]._id], precio: 45000, stock: 15, cantidadVendida: 5 },
            { titulo: "Pelota de fútbol", descripcion: "Pelota profesional número 5", categorias: [categorias["Deportes"]._id], precio: 12999, stock: 40, cantidadVendida: 22 }
        ];

        for (const p of productosSeed) {
            await ProductoModel.findOneAndUpdate(
                { titulo: p.titulo, vendedor: vendedor._id },
                { ...p, vendedor: vendedor._id, moneda: Moneda.ARS, activo: true },
                { upsert: true }
            );
        }

        console.log("Seed completado exitosamente.");
    } catch (error) {
        console.error("Error ejecutando el seed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
