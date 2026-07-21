import { TipoUsuario } from "./enums/TipoUsuario.js"

export class Usuario {
    constructor(id, nombre, email, telefono, tipo, fechaAlta, activo, fechaBaja) {
        this.id = id
        this.nombre = nombre
        this.email = email
        this.telefono = telefono
        this.tipo = tipo
        this.fechaAlta = fechaAlta
        this.activo = activo
        this.fechaBaja = fechaBaja
    }

    esVendedor() {
        return this.tipo === TipoUsuario.VENDEDOR
    }

    esComprador() {
        return this.tipo === TipoUsuario.COMPRADOR
    }
}
