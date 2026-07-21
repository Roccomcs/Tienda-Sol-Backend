import appRoutes from "../routes/appRoutes.js"
import authRoutes from "../routes/authRoutes.js"
import usuarioRoutes from "../routes/usuarioRoutes.js"
import categoriaRoutes from "../routes/categoriaRoutes.js"
import productoRoutes from "../routes/productoRoutes.js"
import usuarioProductoRoutes from "../routes/usuarioProductoRoutes.js"
import pedidoRoutes from "../routes/pedidoRoutes.js"
import usuarioPedidoRoutes from "../routes/usuarioPedidoRoutes.js"
import notificacionRoutes from "../routes/notificacionRoutes.js"

const routes = [
    { basePath: "/auth", routerFunction: authRoutes },
    { basePath: "/health", routerFunction: appRoutes },
    { basePath: "/categorias", routerFunction: categoriaRoutes },
    { basePath: "/productos", routerFunction: productoRoutes },
    { basePath: "/pedidos", routerFunction: pedidoRoutes },
    { basePath: "/usuarios/:id/productos", routerFunction: usuarioProductoRoutes },
    { basePath: "/usuarios/:id/pedidos", routerFunction: usuarioPedidoRoutes },
    { basePath: "/usuarios/:usuarioId/notificaciones", routerFunction: notificacionRoutes },
    { basePath: "/usuarios", routerFunction: usuarioRoutes }
]

export default routes
