// DTO plano de una categoria
export function textCategoria(categoria) {
    if (!categoria) return null
    return {
        id: categoria._id ?? categoria.id,
        nombre: categoria.nombre
    }
}

export function formatCategoria(categoria) {
    return textCategoria(categoria)
}

export function formatCategorias(categorias) {
    return (categorias || []).map(categoria => textCategoria(categoria))
}
