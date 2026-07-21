import { z } from "zod"
import { TipoUsuario } from "../../models/enums/TipoUsuario.js"

// Schema para POST /auth/register
export const registerSchema = z.object({
    nombre: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El nombre es requerido"
                : "El nombre debe ser un string",
    }),
    email: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El email es requerido"
                : "El email debe ser un string",
    }).email("El email no tiene un formato válido"),
    telefono: z.string({
        error: () => "El telefono debe ser un string",
    }).optional(),
    password: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "La password es requerida"
                : "La password debe ser un string",
    }).min(6, "La password debe tener al menos 6 caracteres"),
    tipo: z.enum(Object.values(TipoUsuario), {
        error: () => "El tipo debe ser COMPRADOR o VENDEDOR",
    }),
}).strict();

// Schema para POST /auth/login
export const loginSchema = z.object({
    email: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "El email es requerido"
                : "El email debe ser un string",
    }),
    password: z.string({
        error: (issue) =>
            issue.input === undefined
                ? "La password es requerida"
                : "La password debe ser un string",
    }),
}).strict();
