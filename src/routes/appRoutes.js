import express from 'express'
import AppService from "../services/appService.js"

const pathHealthcheck = "/"

export default function appRoutes() {
    const router = express.Router()
    const service = new AppService()

    router.get(pathHealthcheck, (req, res, next) => service.healthCheck(req, res, next))

    return router
}
