// DTO plano de un usuario (nunca expone la password)
export function textUsuario(usuario) {
    if (!usuario) return null
    return {
        id: usuario._id ?? usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        tipo: usuario.tipo,
        fechaAlta: usuario.fechaAlta
    }
}

export function formatUsuario(usuario) {
    return textUsuario(usuario)
}

export function formatUsuarios(usuarios) {
    return (usuarios || []).map(usuario => textUsuario(usuario))
}
