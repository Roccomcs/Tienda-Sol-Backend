# Tienda Sol - Backend

API REST de **Tienda Sol**, una plataforma de comercio electrónico desarrollada como Trabajo Práctico Integrador de Desarrollo de Software (UTN FRBA, 2C 2025).

La plataforma permite a **vendedores** publicar productos y gestionar su stock, y a **compradores** buscar productos, realizar pedidos y recibir notificaciones sobre el estado de los mismos.

## Tecnologías

- **Node.js** + **Express 5** (JavaScript, ES Modules)
- **MongoDB** + **Mongoose** (base de datos NoSQL documental)
- **Zod** (validación de payloads)
- **JWT** (`jsonwebtoken`) + **bcryptjs** (autenticación)
- **Jest** (testing unitario, ESM)
- **Swagger** (`swagger-ui-express`) (documentación de la API)

## Arquitectura

Arquitectura por capas con inyección de dependencias manual (en `src/app.js`):

```
routes/ → controllers/ → services/ → repositories/ → schemas/mongoose (Model)
```

- **models/**: clases de dominio con la lógica de negocio (implementan el diagrama de clases). Enums en `models/enums/`.
- **schemas/mongoose/**: esquemas de Mongoose (`loadClass` sobre las clases de dominio).
- **schemas/zod/**: esquemas de validación de entrada.
- **mappers/**: transformación de entidades a DTOs de salida.
- **repositories/**: única capa que accede a MongoDB.
- **services/**: reglas de negocio, validación y orquestación. Devuelven `{ success, status, data }`.
- **controllers/**: capa delgada HTTP (`try/catch` + `next(error)`).
- **middlewares/**: manejador de errores central, autenticación y clases de error por entidad.

## Modelo de dominio

`Usuario`, `Producto`, `Categoria`, `Pedido` (con subdocumentos `ItemPedido`, `DireccionEntrega`, `CambioEstadoPedido`), `Notificacion` y `FactoryNotificacion`.
Enums: `TipoUsuario` (COMPRADOR/VENDEDOR), `Moneda` (ARS/USD), `EstadoPedido` (PENDIENTE/ENVIADO/ENTREGADO/CANCELADO).

## Requisitos previos

- Node.js 18+
- MongoDB corriendo localmente (`mongodb://127.0.0.1:27017`)

## Configuración

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear el archivo `src/.env` a partir de `src/.example.env`:
   ```
   PORT = 3000
   HOST = localhost
   MONGODB_URI = mongodb://127.0.0.1:27017
   MONGODB_DB_NAME = tienda-sol
   JWT_SECRET = secreto-super-secreto
   JWT_EXPIRES_IN = 1d
   FRONTEND_URL = http://localhost:3000
   NODE_ENV = development
   ```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Ejecuta el seed y levanta el servidor con nodemon |
| `npm start` | Levanta el servidor |
| `npm run seed` | Carga datos de ejemplo (usuarios, categorías, productos) |
| `npm test` | Ejecuta los tests unitarios |
| `npm run test:coverage` | Ejecuta los tests con reporte de cobertura |

## Endpoints principales

- **Health**: `GET /health`
- **Auth**: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- **Usuarios**: `GET /usuarios`, `GET /usuarios/:id`
- **Categorías**: `GET /categorias`, `POST /categorias`, `GET/DELETE /categorias/:id`
- **Productos**: `POST /productos`, `GET/PUT/DELETE /productos/:id`, `GET /usuarios/:id/productos` (búsqueda con filtros, orden y paginación)
- **Pedidos**: `POST /pedidos`, `PATCH /pedidos/:id/enviar`, `PATCH /pedidos/:id/cancelar`, `GET /usuarios/:id/pedidos`
- **Notificaciones**: `GET /usuarios/:usuarioId/notificaciones?leida=true|false`, `PATCH /usuarios/:usuarioId/notificaciones/:notificacionId`

Documentación interactiva disponible en **`/api-docs`** (Swagger UI).

La colección de Postman está en `docs/Tienda Sol.postman_collection.json` (incluye un flujo E2E ordenado en `Tests/1. Flujo completo`).

## Git Flow

El equipo trabaja con un flujo basado en ramas de feature y Pull Requests sobre `main`:

1. **`main`**: rama estable y desplegable. No se hace push directo.
2. **Ramas de feature**: por cada funcionalidad se crea una rama a partir de `main`, con el prefijo correspondiente:
   - `feature/<nombre>` — nuevas funcionalidades (ej. `feature/gestion-pedidos`).
   - `fix/<nombre>` — corrección de errores.
   - `docs/<nombre>` — documentación.
3. **Commits**: mensajes descriptivos en español, en presente (ej. `Agrega validación de stock en creación de pedido`).
4. **Pull Request**: al terminar la feature se abre un PR hacia `main`. Debe pasar los tests (`npm test`) y ser revisado por al menos otro integrante antes del merge.
5. **Merge**: se integra a `main` mediante *squash and merge* para mantener el historial limpio.

## Estado del proyecto

- ✅ **Entrega 1**: Modelo de objetos, `/health`, configuración del proyecto y Git flow.
- ✅ **Entrega 2**: API REST completa, persistencia MongoDB, tests unitarios (servicios + dominio), Swagger y colección Postman.
- ⏳ **Entrega 3**: Frontend (Next.js).
- ⏳ **Entrega 4**: Integración final, tests de integración/E2E y despliegue.
