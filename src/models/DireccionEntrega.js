export class DireccionEntrega {
    constructor({
        calle,
        altura,
        piso,
        departamento,
        codigoPostal,
        ciudad,
        provincia,
        pais,
        lat,
        lon
    }) {
        this.calle = calle
        this.altura = altura
        this.piso = piso
        this.departamento = departamento
        this.codigoPostal = codigoPostal
        this.ciudad = ciudad
        this.provincia = provincia
        this.pais = pais
        this.lat = lat
        this.lon = lon
    }
}
