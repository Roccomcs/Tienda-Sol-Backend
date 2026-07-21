import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";

// El server recibe las rutas y recibe el puerto
export class Server {
    #controllers = {}
    #app
    #routes

    constructor(app, port) {
        this.#app = app
        this.port = port
        this.#routes = []
        this.#app.use(express.json())
    }

    get app() {
        return this.#app
    }

    setController(controllerClass, controller) {
        this.#controllers[controllerClass.name] = controller
    }

    getController(controllerClass) {
        const controller = this.#controllers[controllerClass.name]
        if (!controller) {
            throw new Error("Controller missing for the given route.")
        }
        return controller;
    }

    addRoute(basePath, route) {
        this.#routes.push({ basePath, route })
    }

    configureRoutes() {
        this.#routes.forEach(({ basePath, route }) => this.#app.use(basePath, route(this.getController.bind(this))))

        // Middleware para manejar rutas no encontradas
        this.#app.use((req, res, next) => {
            res.status(404).json({
                status: 'fail',
                message: "La ruta solicitada no existe"
            });
        });

        // Middleware global de manejo de errores
        this.#app.use(errorHandler);
    }

    launch() {
        const host = process.env.HOST ?? "localhost"
        const port = this.port

        this.app.listen(this.port, () => {
            console.log(`🚀 Servidor corriendo en http://${host}:${port}`);
            console.log(`\n📋 Endpoints disponibles:`);
            console.log(`-------------------------HEALTHCHECK-------------------------`);
            console.log(`   GET     http://${host}:${port}/health`);
            console.log(`\n---------------------------SESIONES-------------------------`);
            console.log(`   POST    http://${host}:${port}/auth/register`);
            console.log(`   POST    http://${host}:${port}/auth/login`);
            console.log(`   POST    http://${host}:${port}/auth/logout`);
            console.log(`\n---------------------------USUARIOS-------------------------`);
            console.log(`   GET     http://${host}:${port}/usuarios`);
            console.log(`   GET     http://${host}:${port}/usuarios/:id`);
            console.log(`\n---------------------------CATEGORIAS-----------------------`);
            console.log(`   GET     http://${host}:${port}/categorias`);
            console.log(`   POST    http://${host}:${port}/categorias`);
            console.log(`\n---------------------------PRODUCTOS------------------------`);
            console.log(`   GET     http://${host}:${port}/productos/:id`);
            console.log(`   POST    http://${host}:${port}/productos`);
            console.log(`   PUT     http://${host}:${port}/productos/:id`);
            console.log(`   DELETE  http://${host}:${port}/productos/:id`);
            console.log(`   GET     http://${host}:${port}/usuarios/:id/productos`);
            console.log(`\n---------------------------PEDIDOS--------------------------`);
            console.log(`   POST    http://${host}:${port}/pedidos`);
            console.log(`   PATCH   http://${host}:${port}/pedidos/:id/enviar`);
            console.log(`   PATCH   http://${host}:${port}/pedidos/:id/cancelar`);
            console.log(`   GET     http://${host}:${port}/usuarios/:id/pedidos`);
            console.log(`\n-------------------------NOTIFICACIONES---------------------`);
            console.log(`   GET     http://${host}:${port}/usuarios/:usuarioId/notificaciones`);
            console.log(`   PATCH   http://${host}:${port}/usuarios/:usuarioId/notificaciones/:notificacionId`);
        });
    }
}
