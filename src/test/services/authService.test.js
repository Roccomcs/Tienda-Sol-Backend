import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import AuthService from '../../services/authService.js';
import { UsuarioValidacionError, UsuarioYaExistenteError } from '../../middlewares/usuarioErrors.js';
import { UsuarioNoAutorizadoError } from '../../middlewares/authErrors.js';

describe('AuthService', () => {
    let authService;
    let mockUsuarioRepository;

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockUsuarioRepository = {
            existsUsuario: jest.fn(),
            createUsuario: jest.fn(),
            getUsuarioByEmail: jest.fn()
        };

        authService = new AuthService(mockUsuarioRepository);
    });

    describe('register', () => {
        const validPayload = {
            nombre: 'Ana',
            email: 'ana@mail.com',
            telefono: '123',
            password: 'secreto123',
            tipo: 'VENDEDOR'
        };

        test('Debe registrar un usuario y devolver un accessToken', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.existsUsuario.mockResolvedValue(false);
            mockUsuarioRepository.createUsuario.mockResolvedValue({ _id: 'u1', ...validPayload });

            // --- ACT ---
            const result = await authService.register(validPayload);

            // --- ASSERT ---
            expect(result.success).toBe(true);
            expect(result.status).toBe(201);
            expect(result.data.accessToken).toBeDefined();
            expect(result.data.usuario.email).toBe('ana@mail.com');
        });

        test('Debe lanzar error si el email ya está registrado', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.existsUsuario.mockResolvedValue(true);

            // --- ACT & ASSERT ---
            await expect(authService.register(validPayload)).rejects.toThrow(UsuarioYaExistenteError);
        });

        test('Debe lanzar error de validación si faltan datos', async () => {
            // --- ACT & ASSERT ---
            await expect(authService.register({ email: 'ana@mail.com' })).rejects.toThrow(UsuarioValidacionError);
        });
    });

    describe('login', () => {
        const passwordHash = bcrypt.hashSync('secreto123', 10);

        test('Debe iniciar sesión con credenciales válidas', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioByEmail.mockResolvedValue({
                _id: 'u1', email: 'ana@mail.com', password: passwordHash, tipo: 'VENDEDOR', activo: true
            });

            // --- ACT ---
            const result = await authService.login({ email: 'ana@mail.com', password: 'secreto123' });

            // --- ASSERT ---
            expect(result.status).toBe(200);
            expect(result.data.accessToken).toBeDefined();
        });

        test('Debe lanzar error si el usuario no existe', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioByEmail.mockResolvedValue(null);

            // --- ACT & ASSERT ---
            await expect(authService.login({ email: 'x@mail.com', password: 'secreto123' })).rejects.toThrow(UsuarioNoAutorizadoError);
        });

        test('Debe lanzar error si la password es incorrecta', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioByEmail.mockResolvedValue({
                _id: 'u1', email: 'ana@mail.com', password: passwordHash, tipo: 'VENDEDOR', activo: true
            });

            // --- ACT & ASSERT ---
            await expect(authService.login({ email: 'ana@mail.com', password: 'incorrecta' })).rejects.toThrow(UsuarioNoAutorizadoError);
        });

        test('Debe lanzar error si el usuario está inactivo', async () => {
            // --- ARRANGE ---
            mockUsuarioRepository.getUsuarioByEmail.mockResolvedValue({
                _id: 'u1', email: 'ana@mail.com', password: passwordHash, tipo: 'VENDEDOR', activo: false
            });

            // --- ACT & ASSERT ---
            await expect(authService.login({ email: 'ana@mail.com', password: 'secreto123' })).rejects.toThrow(UsuarioNoAutorizadoError);
        });
    });

    describe('logout', () => {
        test('Debe devolver un mensaje de sesión cerrada', async () => {
            const result = await authService.logout();
            expect(result.status).toBe(200);
            expect(result.data.message).toBeDefined();
        });
    });
});
