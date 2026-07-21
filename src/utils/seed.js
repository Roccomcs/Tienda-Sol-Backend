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

// Vendedores temáticos (email declarativo -> nombre y categoría principal)
const VENDEDORES = [
    { email: "zapatillas@tiendasol.com", nombre: "Zapatillas Tienda Sol", categoria: "Calzado" },
    { email: "tecnologia@tiendasol.com", nombre: "Tecnología Tienda Sol", categoria: "Tecnología" },
    { email: "futbol@tiendasol.com", nombre: "Fútbol Tienda Sol", categoria: "Deportes" },
    { email: "juegos@tiendasol.com", nombre: "Juegos Tienda Sol", categoria: "Juegos" },
    { email: "vehiculos@tiendasol.com", nombre: "Vehículos Tienda Sol", categoria: "Vehículos" },
    { email: "ropa@tiendasol.com", nombre: "Ropa Tienda Sol", categoria: "Indumentaria" },
    { email: "hogar@tiendasol.com", nombre: "Hogar Tienda Sol", categoria: "Hogar" }
];

const CATEGORIAS = ["Calzado", "Tecnología", "Deportes", "Juegos", "Vehículos", "Indumentaria", "Hogar"];

// Productos por email de vendedor: [titulo, descripcion, precio, stock, cantidadVendida]
const PRODUCTOS = {
    "zapatillas@tiendasol.com": [
        ["Zapatillas Urbanas Río", "Zapatillas urbanas de cuero ecológico con suela vulcanizada", 94999, 24, 40],
        ["Zapatillas Running Delta", "Zapatillas de running livianas con amortiguación", 112500, 15, 18],
        ["Zapatillas Trekking Andes", "Zapatillas de trekking impermeables", 138000, 10, 8],
        ["Zapatillas Lona Clásicas", "Zapatillas de lona para uso diario", 42999, 30, 22]
    ],
    "tecnologia@tiendasol.com": [
        ["Notebook Pro 14\"", "Notebook con procesador de última generación y 16GB RAM", 850000, 12, 30],
        ["Auriculares Bluetooth", "Auriculares inalámbricos con cancelación de ruido", 19999, 50, 60],
        ["Teclado Mecánico RGB", "Teclado retroiluminado switches azules", 34999, 20, 45],
        ["Smartwatch Fit 2", "Reloj inteligente con GPS y monitor cardíaco", 78000, 18, 15]
    ],
    "futbol@tiendasol.com": [
        ["Pelota Profesional N°5", "Pelota de fútbol profesional cosida a mano", 12999, 40, 55],
        ["Camiseta Selección 2026", "Camiseta oficial temporada 2026", 45000, 30, 22],
        ["Guantes de Arquero Pro", "Guantes con grip reforzado", 28000, 12, 9],
        ["Botines Fútbol 5 Grip", "Botines para superficie sintética", 89999, 8, 20]
    ],
    "juegos@tiendasol.com": [
        ["Consola PlayStation 5", "Consola de última generación con lector de discos", 950000, 6, 40],
        ["Juego de Mesa Catan", "Clásico juego de estrategia para 3 a 4 jugadores", 32000, 25, 18],
        ["Joystick Inalámbrico", "Control inalámbrico con vibración", 45000, 20, 33],
        ["Set de Cartas Coleccionables", "Sobre premium de cartas coleccionables", 15000, 40, 12]
    ],
    "vehiculos@tiendasol.com": [
        ["Bicicleta Mountain Bike R29", "Bicicleta todo terreno rodado 29 con 21 cambios", 320000, 8, 14],
        ["Casco para Moto Integral", "Casco integral homologado con visor antirrayas", 65000, 15, 20],
        ["Monopatín Eléctrico X7", "Monopatín eléctrico plegable con 30km de autonomía", 480000, 5, 9],
        ["Cubierta Auto 195/65 R15", "Cubierta para auto de alto rendimiento", 85000, 30, 25]
    ],
    "ropa@tiendasol.com": [
        ["Remera Algodón Orgánico", "Remera de algodón orgánico unisex", 24999, 60, 50],
        ["Campera Rompeviento", "Campera liviana resistente al agua", 89000, 20, 12],
        ["Jean Slim Fit", "Jean de corte slim elastizado", 55000, 35, 28],
        ["Buzo Canguro Oversize", "Buzo de frisa con bolsillo canguro", 47000, 25, 19]
    ],
    "hogar@tiendasol.com": [
        ["Cafetera de Filtro 12 Tazas", "Cafetera automática para 12 tazas", 45000, 15, 8],
        ["Juego de Sábanas Queen", "Juego de sábanas 100% algodón, medida queen", 38000, 22, 16],
        ["Set de Ollas Antiadherentes", "Set de 5 ollas con recubrimiento antiadherente", 72000, 10, 11],
        ["Lámpara de Escritorio LED", "Lámpara LED regulable con puerto USB", 19999, 40, 24]
    ]
};

async function seed() {
    try {
        await mongoose.connect(URL);
        console.log("Conectado a MongoDB para seed.");

        const passHash = await bcrypt.hash("password123", 10);

        // Comprador de ejemplo
        await UsuarioModel.findOneAndUpdate(
            { email: "carlos@tiendasol.com" },
            { nombre: "Carlos Comprador", telefono: "1199887766", password: passHash, tipo: TipoUsuario.COMPRADOR, activo: true },
            { upsert: true, returnDocument: "after" }
        );

        // Categorías
        const categoriasPorNombre = {};
        for (const nombre of CATEGORIAS) {
            const cat = await CategoriaModel.findOneAndUpdate(
                { nombre },
                { nombre },
                { upsert: true, returnDocument: "after" }
            );
            categoriasPorNombre[nombre] = cat;
        }

        // Vendedores temáticos + sus productos
        for (const vendedor of VENDEDORES) {
            const usuarioVendedor = await UsuarioModel.findOneAndUpdate(
                { email: vendedor.email },
                { nombre: vendedor.nombre, telefono: "1100000000", password: passHash, tipo: TipoUsuario.VENDEDOR, activo: true },
                { upsert: true, returnDocument: "after" }
            );

            const categoria = categoriasPorNombre[vendedor.categoria];
            for (const [titulo, descripcion, precio, stock, cantidadVendida] of PRODUCTOS[vendedor.email]) {
                await ProductoModel.findOneAndUpdate(
                    { titulo, vendedor: usuarioVendedor._id },
                    {
                        titulo, descripcion, precio, stock, cantidadVendida,
                        vendedor: usuarioVendedor._id,
                        categorias: [categoria._id],
                        moneda: Moneda.ARS,
                        fotos: [],
                        activo: true
                    },
                    { upsert: true }
                );
            }
        }

        console.log(`Seed completado: ${VENDEDORES.length} vendedores, ${CATEGORIAS.length} categorías, ${Object.values(PRODUCTOS).flat().length} productos.`);
    } catch (error) {
        console.error("Error ejecutando el seed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
