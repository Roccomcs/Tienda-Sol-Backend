import { textCategoria } from "./categoriaMapper.js"
import { textUsuario } from "./usuarioMapper.js"

// DTO plano de un producto
export function textProducto(producto) {
    if (!producto) return null
    return {
        id: producto._id ?? producto.id,
        vendedor: producto.vendedor && (producto.vendedor._id || producto.vendedor.id)
            ? textUsuario(producto.vendedor)
            : (producto.vendedor ?? null),
        titulo: producto.titulo,
        descripcion: producto.descripcion,
        categorias: (producto.categorias || []).map(cat =>
            cat && (cat._id || cat.id) ? textCategoria(cat) : cat
        ),
        precio: producto.precio,
        moneda: producto.moneda,
        stock: producto.stock,
        fotos: producto.fotos || [],
        activo: producto.activo,
        cantidadVendida: producto.cantidadVendida
    }
}

export function formatProducto(producto) {
    return textProducto(producto)
}

export function formatProductos(productos) {
    return (productos || []).map(producto => textProducto(producto))
}

// DTO de una página de resultados de búsqueda de productos
export function formatProductosPaginados({ items, total, page, limit }) {
    return {
        items: formatProductos(items),
        total,
        page,
        limit,
        totalPaginas: Math.ceil(total / limit)
    }
}
