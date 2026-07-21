import { z } from "zod"

const itemPedidoSchema = z.object({
    productoId: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El productoId es requerido"
                : "El productoId debe ser un string",
    }),
    cantidad: z.number({
        error: (issue) =>
            issue.input === undefined
                ? "La cantidad es requerida"
                : "La cantidad debe ser un number",
    }).int("La cantidad debe ser un entero").min(1, "La cantidad debe ser al menos 1"),
}).strict();

const direccionEntregaSchema = z.object({
    calle: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "La calle es requerida"
                : "La calle debe ser un string",
    }),
    altura: z.string().optional(),
    piso: z.string().optional(),
    departamento: z.string().optional(),
    codigoPostal: z.string().optional(),
    ciudad: z.string().optional(),
    provincia: z.string().optional(),
    pais: z.string().optional(),
    lat: z.string().optional(),
    lon: z.string().optional(),
}).strict();

export const createPedidoSchema = z.object({
    items: z.array(itemPedidoSchema, {
        error: () => "Los items son requeridos",
    }).min(1, "El pedido debe tener al menos un item"),
    direccionEntrega: direccionEntregaSchema,
}).strict();
