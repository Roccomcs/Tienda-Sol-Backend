import express from "express"
import cors from "cors"

import { Server } from "./server.js"

// Swagger
import swaggerUi from 'swagger-ui-express'
import { specs } from './swaggerConfig.js'

// Routes
import routes from "./routes/routes.js"

// Repositories
import { UsuarioRepository } from "./repositories/usuarioRepository.js"
import { CategoriaRepository } from "./repositories/categoriaRepository.js"
import { ProductoRepository } from "./repositories/productoRepository.js"
import { PedidoRepository } from "./repositories/pedidoRepository.js"
import { NotificacionRepository } from "./repositories/notificacionRepository.js"

// Services
import AuthService from "./services/authService.js"
import UsuarioService from "./services/usuarioService.js"
import CategoriaService from "./services/categoriaService.js"
import ProductoService from "./services/productoService.js"
import NotificacionService from "./services/notificacionService.js"
import PedidoService from "./services/pedidoService.js"

// Controllers
import { AuthController } from "./controllers/authController.js"
import { UsuarioController } from "./controllers/usuarioController.js"
import { CategoriaController } from "./controllers/categoriaController.js"
import { ProductoController } from "./controllers/productoController.js"
import { PedidoController } from "./controllers/pedidoController.js"
import { NotificacionController } from "./controllers/notificacionController.js"

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

const server = new Server(app)

// ---------- SWAGGER ----------

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// ---------- REPOSITORIES ----------

const usuarioRepository = new UsuarioRepository()
const categoriaRepository = new CategoriaRepository()
const productoRepository = new ProductoRepository()
const pedidoRepository = new PedidoRepository()
const notificacionRepository = new NotificacionRepository()

// ---------- SERVICES ----------

const authService = new AuthService(usuarioRepository)
const usuarioService = new UsuarioService(usuarioRepository)
const categoriaService = new CategoriaService(categoriaRepository)
const productoService = new ProductoService(productoRepository, usuarioRepository, categoriaRepository)
const notificacionService = new NotificacionService(notificacionRepository)
const pedidoService = new PedidoService(pedidoRepository, productoRepository, usuarioRepository, notificacionService)

// ---------- CONTROLLERS ----------

const authController = new AuthController(authService)
const usuarioController = new UsuarioController(usuarioService)
const categoriaController = new CategoriaController(categoriaService)
const productoController = new ProductoController(productoService)
const pedidoController = new PedidoController(pedidoService)
const notificacionController = new NotificacionController(notificacionService)

// ---------- REGISTER CONTROLLERS ----------

server.setController(AuthController, authController)
server.setController(UsuarioController, usuarioController)
server.setController(CategoriaController, categoriaController)
server.setController(ProductoController, productoController)
server.setController(PedidoController, pedidoController)
server.setController(NotificacionController, notificacionController)

// ---------- ROUTES ----------

routes.forEach(routeDef => server.addRoute(routeDef.basePath, routeDef.routerFunction))

server.configureRoutes()

export default server
