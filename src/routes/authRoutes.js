import express from "express"
import { AuthController } from "../controllers/authController.js"

const authRoutes = (getController) => {
    const router = express.Router()
    const authController = getController(AuthController)

    router.post("/register", (req, res, next) => authController.register(req, res, next))
    router.post("/login", (req, res, next) => authController.login(req, res, next))
    router.post("/logout", (req, res, next) => authController.logout(req, res, next))

    return router
}

export default authRoutes
