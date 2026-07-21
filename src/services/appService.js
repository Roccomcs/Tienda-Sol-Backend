export default class AppService {
    async healthCheck(_req, res, next) {
        try {
            return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
        } catch (error) {
            next(error)
        }
    }
}
