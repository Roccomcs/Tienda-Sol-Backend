import { jest } from "@jest/globals"
import mongoose from "mongoose"
import request from "supertest"
import server from "../../app.js"

// Test de integración de la capa de controladores (HTTP real con supertest).
// Ejercita el flujo completo del sistema contra una base de datos de prueba:
// registro/login, búsqueda de productos, creación de pedido (stock + notificaciones),
// envío, cancelación, historial y notificaciones.
const app = server.app

const URL_TEST = "mongodb://127.0.0.1:27017/tienda-sol-test"
const sufijo = Date.now()

let tokenVendedor
let tokenComprador
let vendedorId
let compradorId
let categoriaId
let productoId
let pedidoId

beforeAll(async () => {
    // Silenciar logs ruidosos del error handler durante los tests
    jest.spyOn(console, "error").mockImplementation(() => {})
    await mongoose.connect(URL_TEST)
}, 30000)

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
})

describe("Flujo completo (integración de controladores)", () => {
    test("GET /health responde 200", async () => {
        const res = await request(app).get("/health")
        expect(res.status).toBe(200)
        expect(res.body.status).toBe("ok")
    })

    test("Registra un vendedor y un comprador", async () => {
        const resVendedor = await request(app).post("/auth/register").send({
            nombre: "Vendedor Test", email: `vendedor${sufijo}@test.com`, password: "password123", tipo: "VENDEDOR"
        })
        expect(resVendedor.status).toBe(201)
        expect(resVendedor.body.accessToken).toBeDefined()
        tokenVendedor = resVendedor.body.accessToken
        vendedorId = resVendedor.body.usuario.id

        const resComprador = await request(app).post("/auth/register").send({
            nombre: "Comprador Test", email: `comprador${sufijo}@test.com`, password: "password123", tipo: "COMPRADOR"
        })
        expect(resComprador.status).toBe(201)
        tokenComprador = resComprador.body.accessToken
        compradorId = resComprador.body.usuario.id
    })

    test("Un comprador no puede publicar productos (401)", async () => {
        const res = await request(app)
            .post("/productos")
            .set("Authorization", `Bearer ${tokenComprador}`)
            .send({ titulo: "X", precio: 1, stock: 1 })
        expect(res.status).toBe(401)
    })

    test("Crea una categoría y un producto", async () => {
        const resCat = await request(app).post("/categorias").send({ nombre: `Categoria ${sufijo}` })
        expect(resCat.status).toBe(201)
        categoriaId = resCat.body.id

        const resProd = await request(app)
            .post("/productos")
            .set("Authorization", `Bearer ${tokenVendedor}`)
            .send({ titulo: "Producto Test", descripcion: "Un producto", precio: 1000, moneda: "ARS", stock: 10, categorias: [categoriaId] })
        expect(resProd.status).toBe(201)
        expect(resProd.body.stock).toBe(10)
        productoId = resProd.body.id
    })

    test("El producto aparece en el catálogo global y en el del vendedor", async () => {
        const resGlobal = await request(app).get("/productos").query({ q: "Producto Test" })
        expect(resGlobal.status).toBe(200)
        expect(resGlobal.body.items.some((p) => p.id === productoId)).toBe(true)

        const resVendedor = await request(app).get(`/usuarios/${vendedorId}/productos`)
        expect(resVendedor.status).toBe(200)
        expect(resVendedor.body.total).toBeGreaterThanOrEqual(1)
    })

    test("Crea un pedido: valida y reduce stock y notifica al vendedor", async () => {
        const res = await request(app)
            .post("/pedidos")
            .set("Authorization", `Bearer ${tokenComprador}`)
            .send({ items: [{ productoId, cantidad: 2 }], direccionEntrega: { calle: "Av. Siempreviva", altura: "742" } })
        expect(res.status).toBe(201)
        expect(res.body.estado).toBe("PENDIENTE")
        expect(res.body.total).toBe(2000)
        pedidoId = res.body.id

        // El stock se redujo de 10 a 8
        const resProd = await request(app).get(`/productos/${productoId}`)
        expect(resProd.body.stock).toBe(8)

        // El vendedor tiene una notificación sin leer
        const resNotif = await request(app).get(`/usuarios/${vendedorId}/notificaciones`).query({ leida: false })
        expect(resNotif.body.length).toBeGreaterThanOrEqual(1)
    })

    test("El vendedor marca el pedido como enviado y se notifica al comprador", async () => {
        const res = await request(app)
            .patch(`/pedidos/${pedidoId}/enviar`)
            .set("Authorization", `Bearer ${tokenVendedor}`)
        expect(res.status).toBe(200)
        expect(res.body.estado).toBe("ENVIADO")

        const resNotif = await request(app).get(`/usuarios/${compradorId}/notificaciones`).query({ leida: false })
        expect(resNotif.body.length).toBeGreaterThanOrEqual(1)

        // Marcar una notificación como leída
        const notificacionId = resNotif.body[0].id
        const resLeida = await request(app).patch(`/usuarios/${compradorId}/notificaciones/${notificacionId}`)
        expect(resLeida.status).toBe(200)
        expect(resLeida.body.leida).toBe(true)
    })

    test("El historial del comprador incluye el pedido", async () => {
        const res = await request(app).get(`/usuarios/${compradorId}/pedidos`)
        expect(res.status).toBe(200)
        expect(res.body.some((p) => p.id === pedidoId)).toBe(true)
    })

    test("Las ventas del vendedor incluyen el pedido", async () => {
        const res = await request(app).get(`/usuarios/${vendedorId}/ventas`)
        expect(res.status).toBe(200)
        expect(res.body.some((p) => p.id === pedidoId)).toBe(true)
    })

    test("No se puede cancelar un pedido ya enviado (409)", async () => {
        const res = await request(app)
            .patch(`/pedidos/${pedidoId}/cancelar`)
            .set("Authorization", `Bearer ${tokenComprador}`)
            .send({ motivo: "Prueba" })
        expect(res.status).toBe(409)
    })
})
