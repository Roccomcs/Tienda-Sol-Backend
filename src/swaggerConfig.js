// Especificación OpenAPI 3 escrita a mano para la API de Tienda Sol.
// Se sirve con swagger-ui-express en /api-docs.

const bearerAuth = [{ bearerAuth: [] }]

const jsonBody = (schema) => ({
    required: true,
    content: { "application/json": { schema } }
})

export const specs = {
    openapi: "3.0.0",
    info: {
        title: "Tienda Sol API",
        version: "1.0.0",
        description: "API REST de Tienda Sol - Plataforma de Comercio Electrónico. Trabajo Práctico Integrador 2C 2025."
    },
    servers: [
        process.env.RENDER_EXTERNAL_URL
            ? { url: process.env.RENDER_EXTERNAL_URL, description: "Producción" }
            : { url: `http://localhost:${process.env.PORT || 3000}`, description: "Desarrollo local" }
    ],
    tags: [
        { name: "Health", description: "Estado de salud del sistema" },
        { name: "Auth", description: "Registro, login y logout" },
        { name: "Usuarios", description: "Consulta de usuarios" },
        { name: "Categorías", description: "Gestión de categorías" },
        { name: "Productos", description: "Publicación y búsqueda de productos" },
        { name: "Pedidos", description: "Ciclo de vida de los pedidos" },
        { name: "Notificaciones", description: "Notificaciones dentro de la plataforma" }
    ],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        },
        schemas: {
            RegisterInput: {
                type: "object",
                required: ["nombre", "email", "password", "tipo"],
                properties: {
                    nombre: { type: "string", example: "Ana Vendedora" },
                    email: { type: "string", example: "ana@tiendasol.com" },
                    telefono: { type: "string", example: "1122334455" },
                    password: { type: "string", example: "secreto123" },
                    tipo: { type: "string", enum: ["COMPRADOR", "VENDEDOR"], example: "VENDEDOR" }
                }
            },
            LoginInput: {
                type: "object",
                required: ["email", "password"],
                properties: {
                    email: { type: "string", example: "ana@tiendasol.com" },
                    password: { type: "string", example: "secreto123" }
                }
            },
            CategoriaInput: {
                type: "object",
                required: ["nombre"],
                properties: { nombre: { type: "string", example: "Electrónica" } }
            },
            ProductoInput: {
                type: "object",
                required: ["titulo", "precio", "stock"],
                properties: {
                    titulo: { type: "string", example: "Auriculares Bluetooth" },
                    descripcion: { type: "string", example: "Auriculares inalámbricos con cancelación de ruido" },
                    categorias: { type: "array", items: { type: "string" }, example: [] },
                    precio: { type: "number", example: 19999.99 },
                    moneda: { type: "string", enum: ["ARS", "USD"], example: "ARS" },
                    stock: { type: "integer", example: 50 },
                    fotos: { type: "array", items: { type: "string" }, example: [] }
                }
            },
            PedidoInput: {
                type: "object",
                required: ["items", "direccionEntrega"],
                properties: {
                    items: {
                        type: "array",
                        items: {
                            type: "object",
                            required: ["productoId", "cantidad"],
                            properties: {
                                productoId: { type: "string", example: "665f1f77bcf86cd799439011" },
                                cantidad: { type: "integer", example: 2 }
                            }
                        }
                    },
                    direccionEntrega: {
                        type: "object",
                        required: ["calle"],
                        properties: {
                            calle: { type: "string", example: "Av. Medrano" },
                            altura: { type: "string", example: "951" },
                            ciudad: { type: "string", example: "CABA" },
                            provincia: { type: "string", example: "Buenos Aires" },
                            pais: { type: "string", example: "Argentina" },
                            codigoPostal: { type: "string", example: "C1179" }
                        }
                    }
                }
            },
            Error: {
                type: "object",
                properties: {
                    status: { type: "string", example: "error" },
                    message: { type: "string", example: "Mensaje de error" }
                }
            }
        }
    },
    paths: {
        "/health": {
            get: {
                tags: ["Health"],
                summary: "Estado de salud del sistema",
                responses: { 200: { description: "El sistema está operativo" } }
            }
        },
        "/auth/register": {
            post: {
                tags: ["Auth"],
                summary: "Registrar un usuario (comprador o vendedor)",
                requestBody: jsonBody({ $ref: "#/components/schemas/RegisterInput" }),
                responses: {
                    201: { description: "Usuario registrado, devuelve accessToken" },
                    409: { description: "El email ya está registrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                }
            }
        },
        "/auth/login": {
            post: {
                tags: ["Auth"],
                summary: "Iniciar sesión",
                requestBody: jsonBody({ $ref: "#/components/schemas/LoginInput" }),
                responses: {
                    200: { description: "Login exitoso, devuelve accessToken" },
                    401: { description: "Credenciales inválidas", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                }
            }
        },
        "/auth/logout": {
            post: {
                tags: ["Auth"],
                summary: "Cerrar sesión",
                responses: { 200: { description: "Sesión cerrada" } }
            }
        },
        "/usuarios": {
            get: {
                tags: ["Usuarios"],
                summary: "Listar usuarios activos",
                responses: { 200: { description: "Lista de usuarios" } }
            }
        },
        "/usuarios/{id}": {
            get: {
                tags: ["Usuarios"],
                summary: "Obtener un usuario por ID",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: {
                    200: { description: "Usuario encontrado" },
                    404: { description: "Usuario no encontrado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
                }
            }
        },
        "/categorias": {
            get: {
                tags: ["Categorías"],
                summary: "Listar categorías",
                responses: { 200: { description: "Lista de categorías" } }
            },
            post: {
                tags: ["Categorías"],
                summary: "Crear una categoría",
                requestBody: jsonBody({ $ref: "#/components/schemas/CategoriaInput" }),
                responses: {
                    201: { description: "Categoría creada" },
                    409: { description: "La categoría ya existe" }
                }
            }
        },
        "/categorias/{id}": {
            get: {
                tags: ["Categorías"],
                summary: "Obtener una categoría por ID",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Categoría encontrada" }, 404: { description: "No encontrada" } }
            },
            delete: {
                tags: ["Categorías"],
                summary: "Eliminar una categoría",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Categoría eliminada" }, 404: { description: "No encontrada" } }
            }
        },
        "/productos": {
            get: {
                tags: ["Productos"],
                summary: "Catálogo global: buscar productos de todo el marketplace con filtros, orden y paginación",
                parameters: [
                    { name: "q", in: "query", schema: { type: "string" }, description: "Término (nombre, categoría, descripción)" },
                    { name: "categoria", in: "query", schema: { type: "string" }, description: "ID o nombre de categoría" },
                    { name: "precioMin", in: "query", schema: { type: "number" } },
                    { name: "precioMax", in: "query", schema: { type: "number" } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
                    { name: "orden", in: "query", schema: { type: "string", enum: ["precioAsc", "precioDesc", "masVendido"] } }
                ],
                responses: { 200: { description: "Página de productos" } }
            },
            post: {
                tags: ["Productos"],
                summary: "Publicar un producto (rol VENDEDOR)",
                security: bearerAuth,
                requestBody: jsonBody({ $ref: "#/components/schemas/ProductoInput" }),
                responses: {
                    201: { description: "Producto creado" },
                    401: { description: "No autorizado" }
                }
            }
        },
        "/productos/{id}": {
            get: {
                tags: ["Productos"],
                summary: "Obtener un producto por ID",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Producto encontrado" }, 404: { description: "No encontrado" } }
            },
            put: {
                tags: ["Productos"],
                summary: "Actualizar un producto (rol VENDEDOR dueño)",
                security: bearerAuth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: jsonBody({ $ref: "#/components/schemas/ProductoInput" }),
                responses: { 200: { description: "Producto actualizado" }, 401: { description: "No autorizado" }, 404: { description: "No encontrado" } }
            },
            delete: {
                tags: ["Productos"],
                summary: "Dar de baja un producto (rol VENDEDOR dueño)",
                security: bearerAuth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Producto dado de baja" }, 401: { description: "No autorizado" }, 404: { description: "No encontrado" } }
            }
        },
        "/usuarios/{id}/productos": {
            get: {
                tags: ["Productos"],
                summary: "Listar productos de un vendedor con filtros, orden y paginación",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID del vendedor" },
                    { name: "q", in: "query", schema: { type: "string" }, description: "Término de búsqueda (nombre, categoría, descripción)" },
                    { name: "precioMin", in: "query", schema: { type: "number" } },
                    { name: "precioMax", in: "query", schema: { type: "number" } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
                    { name: "orden", in: "query", schema: { type: "string", enum: ["precioAsc", "precioDesc", "masVendido"] } }
                ],
                responses: { 200: { description: "Página de productos" }, 404: { description: "Vendedor no encontrado" } }
            }
        },
        "/pedidos": {
            post: {
                tags: ["Pedidos"],
                summary: "Crear un pedido (rol COMPRADOR). Valida stock y notifica al vendedor.",
                security: bearerAuth,
                requestBody: jsonBody({ $ref: "#/components/schemas/PedidoInput" }),
                responses: {
                    201: { description: "Pedido creado" },
                    401: { description: "No autorizado" },
                    409: { description: "Stock insuficiente" }
                }
            }
        },
        "/pedidos/{id}/enviar": {
            patch: {
                tags: ["Pedidos"],
                summary: "Marcar un pedido como enviado (rol VENDEDOR). Notifica al comprador.",
                security: bearerAuth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Pedido enviado" }, 401: { description: "No autorizado" }, 404: { description: "No encontrado" } }
            }
        },
        "/pedidos/{id}/cancelar": {
            patch: {
                tags: ["Pedidos"],
                summary: "Cancelar un pedido antes de ser enviado (rol COMPRADOR). Notifica al vendedor.",
                security: bearerAuth,
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                requestBody: {
                    required: false,
                    content: { "application/json": { schema: { type: "object", properties: { motivo: { type: "string" } } } } }
                },
                responses: { 200: { description: "Pedido cancelado" }, 401: { description: "No autorizado" }, 409: { description: "El pedido ya fue enviado" } }
            }
        },
        "/usuarios/{id}/pedidos": {
            get: {
                tags: ["Pedidos"],
                summary: "Historial de pedidos de un usuario",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                responses: { 200: { description: "Lista de pedidos" }, 404: { description: "Usuario no encontrado" } }
            }
        },
        "/usuarios/{id}/ventas": {
            get: {
                tags: ["Pedidos"],
                summary: "Pedidos recibidos por un vendedor (incluyen sus productos)",
                parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "ID del vendedor" }],
                responses: { 200: { description: "Lista de pedidos recibidos" }, 404: { description: "Vendedor no encontrado" } }
            }
        },
        "/usuarios/{usuarioId}/notificaciones": {
            get: {
                tags: ["Notificaciones"],
                summary: "Listar notificaciones de un usuario (filtrable por leídas/no leídas)",
                parameters: [
                    { name: "usuarioId", in: "path", required: true, schema: { type: "string" } },
                    { name: "leida", in: "query", schema: { type: "boolean" }, description: "true = leídas, false = no leídas" }
                ],
                responses: { 200: { description: "Lista de notificaciones" } }
            }
        },
        "/usuarios/{usuarioId}/notificaciones/{notificacionId}": {
            patch: {
                tags: ["Notificaciones"],
                summary: "Marcar una notificación como leída",
                parameters: [
                    { name: "usuarioId", in: "path", required: true, schema: { type: "string" } },
                    { name: "notificacionId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: { 200: { description: "Notificación marcada como leída" }, 404: { description: "No encontrada" } }
            }
        }
    }
}
