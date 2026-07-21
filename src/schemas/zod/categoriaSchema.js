import { z } from "zod"

export const createCategoriaSchema = z.object({
    nombre: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El nombre es requerido"
                : "El nombre debe ser un string",
    }),
}).strict();

export const updateCategoriaSchema = z.object({
    nombre: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El nombre es requerido"
                : "El nombre debe ser un string",
    }),
}).strict();
