import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

import server from "./app.js"

import { MongoDBClient } from "./config/database.js"

const PORT = process.env.PORT || 3000

const start = async () => {
    try {
        // conectar mongo
        await MongoDBClient.connect()
        // levantar servidor
        server.port = PORT
        server.launch()
    } catch (error) {
        console.error(error)
    }

}

start()
