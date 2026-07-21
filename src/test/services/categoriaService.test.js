import { jest } from "@jest/globals";
import CategoriaService from '../../services/categoriaService.js';
import { CategoriaValidacionError, CategoriaYaExistenteError, CategoriaNoEncontradaError } from '../../middlewares/categoriaErrors.js';

describe('CategoriaService', () => {
    let categoriaService;
    let mockCategoriaRepository;

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockCategoriaRepository = {
            getAllCategorias: jest.fn(),
            getCategoriaById: jest.fn(),
            existsCategoria: jest.fn(),
            createCategoria: jest.fn(),
            deleteCategoriaById: jest.fn()
        };

        categoriaService = new CategoriaService(mockCategoriaRepository);
    });

    describe('getAllCategorias', () => {
        test('Debe obtener todas las categorías', async () => {
            mockCategoriaRepository.getAllCategorias.mockResolvedValue([{ _id: '1', nombre: 'Electrónica' }]);
            const result = await categoriaService.getAllCategorias();
            expect(result.status).toBe(200);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('getCategoriaById', () => {
        const validId = '507f1f77bcf86cd799439011';

        test('Debe obtener una categoría por ID', async () => {
            mockCategoriaRepository.getCategoriaById.mockResolvedValue({ _id: validId, nombre: 'Hogar' });
            const result = await categoriaService.getCategoriaById(validId);
            expect(result.data.nombre).toBe('Hogar');
        });

        test('Debe lanzar error si la categoría no existe', async () => {
            mockCategoriaRepository.getCategoriaById.mockResolvedValue(null);
            await expect(categoriaService.getCategoriaById(validId)).rejects.toThrow(CategoriaNoEncontradaError);
        });
    });

    describe('createCategoria', () => {
        test('Debe crear una categoría con datos válidos', async () => {
            mockCategoriaRepository.existsCategoria.mockResolvedValue(false);
            mockCategoriaRepository.createCategoria.mockResolvedValue({ _id: '1', nombre: 'Deportes' });
            const result = await categoriaService.createCategoria({ nombre: 'Deportes' });
            expect(result.status).toBe(201);
            expect(mockCategoriaRepository.createCategoria).toHaveBeenCalledWith({ nombre: 'Deportes' });
        });

        test('Debe lanzar error de validación si falta el nombre', async () => {
            await expect(categoriaService.createCategoria({})).rejects.toThrow(CategoriaValidacionError);
        });

        test('Debe lanzar error si la categoría ya existe', async () => {
            mockCategoriaRepository.existsCategoria.mockResolvedValue(true);
            await expect(categoriaService.createCategoria({ nombre: 'Deportes' })).rejects.toThrow(CategoriaYaExistenteError);
        });
    });

    describe('deleteCategoriaById', () => {
        const validId = '507f1f77bcf86cd799439011';

        test('Debe eliminar una categoría existente', async () => {
            mockCategoriaRepository.getCategoriaById.mockResolvedValue({ _id: validId, nombre: 'Hogar' });
            mockCategoriaRepository.deleteCategoriaById.mockResolvedValue({ _id: validId });
            const result = await categoriaService.deleteCategoriaById(validId);
            expect(result.status).toBe(200);
            expect(mockCategoriaRepository.deleteCategoriaById).toHaveBeenCalledWith(validId);
        });

        test('Debe lanzar error si la categoría a eliminar no existe', async () => {
            mockCategoriaRepository.getCategoriaById.mockResolvedValue(null);
            await expect(categoriaService.deleteCategoriaById(validId)).rejects.toThrow(CategoriaNoEncontradaError);
        });
    });
});
