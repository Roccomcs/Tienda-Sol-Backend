import { Usuario } from '../../models/Usuario.js';
import { TipoUsuario } from '../../models/enums/TipoUsuario.js';

describe('Usuario Model', () => {
    test('esVendedor debería ser true para un usuario VENDEDOR', () => {
        const usuario = new Usuario('1', 'Ana', 'ana@mail.com', '123', TipoUsuario.VENDEDOR);
        expect(usuario.esVendedor()).toBe(true);
        expect(usuario.esComprador()).toBe(false);
    });

    test('esComprador debería ser true para un usuario COMPRADOR', () => {
        const usuario = new Usuario('2', 'Carlos', 'carlos@mail.com', '456', TipoUsuario.COMPRADOR);
        expect(usuario.esComprador()).toBe(true);
        expect(usuario.esVendedor()).toBe(false);
    });
});
