import { Notificacion } from '../../models/Notificacion.js';

describe('Notificacion Model', () => {
    test('debería crearse como no leída por defecto', () => {
        const notificacion = new Notificacion({ id: '1', usuarioDestino: 'u1', mensaje: 'Hola' });
        expect(notificacion.leida).toBe(false);
        expect(notificacion.fechaLeida).toBeNull();
    });

    test('marcarComoLeida debería marcarla como leída y registrar la fecha', () => {
        const notificacion = new Notificacion({ id: '1', usuarioDestino: 'u1', mensaje: 'Hola' });
        notificacion.marcarComoLeida();
        expect(notificacion.leida).toBe(true);
        expect(notificacion.fechaLeida).toBeInstanceOf(Date);
    });
});
