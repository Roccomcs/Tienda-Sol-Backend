import { jest } from "@jest/globals";
import UsuarioService from '../../services/usuarioService.js';
import { UsuarioNoEncontradoError } from '../../middlewares/usuarioErrors.js';

describe('UsuarioService', () => {
    let usuarioService;
    let mockUsuarioRepository;

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockUsuarioRepository = {
            getAllUsuarios: jest.fn(),
            getUsuarioById: jest.fn()
        };

        usuarioService = new UsuarioService(mockUsuarioRepository);
    });

    describe('getAllUsuarios', () => {
        test('Debe obtener todos los usuarios', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getAllUsuarios.mockResolvedValue([
                { _id: '1', nombre: 'Ana', email: 'ana@mail.com', tipo: 'VENDEDOR' }
            ]);

            // --- ACT ---
            const result = await usuarioService.getAllUsuarios();

            // --- ASSERT ---
            expect(result.status).toBe(200);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].email).toBe('ana@mail.com');
        });
    });

    describe('getUsuarioById', () => {
        const validId = '507f1f77bcf86cd799439011';

        test('Debe obtener un usuario por ID', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: validId, nombre: 'Ana', tipo: 'VENDEDOR' });

            // --- ACT ---
            const result = await usuarioService.getUsuarioById(validId);

            // --- ASSERT ---
            expect(result.status).toBe(200);
            expect(result.data.id).toBe(validId);
        });

        test('Debe lanzar error si el usuario no existe', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioById.mockResolvedValue(null);

            // --- ACT & ASSERT ---
            await expect(usuarioService.getUsuarioById(validId)).rejects.toThrow(UsuarioNoEncontradoError);
        });
    });
});
