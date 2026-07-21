import { z } from "zod"
import { Moneda } from "../../models/enums/Moneda.js"

export const createProductoSchema = z.object({
    titulo: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El titulo es requerido"
                : "El titulo debe ser un string",
    }),
    descripcion: z.string({
        error: () => "La descripcion debe ser un string",
    }).optional(),
    categorias: z.array(z.string(), {
        error: () => "Las categorias deben ser un arreglo de IDs",
    }).optional(),
    precio: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "El precio es requerido"
                : "El precio debe ser un number",
    }).min(0, "El precio no puede ser negativo"),
    moneda: z.enum(Object.values(Moneda), {
        error: () => "La moneda debe ser ARS o USD",
    }).optional(),
    stock: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "El stock es requerido"
                : "El stock debe ser un number",
    }).int("El stock debe ser un entero").min(0, "El stock no puede ser negativo"),
    fotos: z.array(z.string(), {
        error: () => "Las fotos deben ser un arreglo de URLs",
    }).optional(),
}).strict();

export const updateProductoSchema = z.object({
    titulo: z.string().optional(),
    descripcion: z.string().optional(),
    categorias: z.array(z.string()).optional(),
    precio: z.number().min(0, "El precio no puede ser negativo").optional(),
    moneda: z.enum(Object.values(Moneda)).optional(),
    stock: z.number().int().min(0, "El stock no puede ser negativo").optional(),
    fotos: z.array(z.string()).optional(),
    activo: z.boolean().optional(),
}).strict();
