/*Esto ayuda a mostrar información útil durante el desarrollo y a ocultar detalles sensibles en producción. */

const handleMongoError = (err) => {
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo'
        const value = err.keyValue?.[field]
        return { status: 409, message: `Ya existe un registro con ${field}: "${value}"` }
    }
    return null
}

const handleJsonParseError = (err) => {
    if (err.type === 'entity.parse.failed') {
        return { status: 400, message: 'El cuerpo de la solicitud contiene JSON inválido.' }
    }
    return null
}

export const errorHandler = (err, req, res, next) => {
    const mongoError = handleMongoError(err)
    if (mongoError) {
        console.error(`[${mongoError.status}] DuplicateKeyError: ${mongoError.message}`)
        return res.status(mongoError.status).json({ status: 'error', message: mongoError.message })
    }

    const jsonError = handleJsonParseError(err)
    if (jsonError) {
        console.error(`[${jsonError.status}] JsonParseError: ${err.message}`)
        return res.status(jsonError.status).json({ status: 'error', message: jsonError.message })
    }

    // Obtener el statusCode del error personalizado, si no existe usar 500
    const statusCode = err.status || 500;
    const statusMessage = 'error';

    // Log para debugging
    console.error(`[${statusCode}] ${err.name}: ${err.message}`);

    if (process.env.NODE_ENV === 'development') {
        // En desarrollo, mostrar error limpio con detalles
        if (err.isOperational) {
            res.status(statusCode).json({
                status: statusMessage,
                message: err.message,
                ...(err.issues && { issues: err.issues })
            });
        } else {
            res.status(statusCode).json({
                status: statusMessage,
                message: err.message,
                stack: err.stack
            });
        }
    } else {
        // Producción
        if (err.isOperational) {
            res.status(statusCode).json({
                status: statusMessage,
                message: err.message,
                ...(err.issues && { issues: err.issues })
            });
        } else {
            // Error de programación: no enviar detalles al cliente
            console.error('ERROR', err);
            res.status(500).json({
                status: 'error',
                message: 'Error del servidor.'
            });
        }
    }
};
