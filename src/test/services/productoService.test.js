import { jest } from "@jest/globals";
import ProductoService from '../../services/productoService.js';
import { ProductoValidacionError, ProductoNoEncontradoError } from '../../middlewares/productoErrors.js';
import { UsuarioNoEncontradoError } from '../../middlewares/usuarioErrors.js';
import { UsuarioNoAutorizadoError } from '../../middlewares/authErrors.js';

describe('ProductoService', () => {
    let productoService;
    let mockProductoRepository;
    let mockUsuarioRepository;
    let mockCategoriaRepository;

    const vendedorId = '507f1f77bcf86cd799439011';
    const productoId = '507f1f77bcf86cd799439012';

    beforeEach(() => {
        // --- ARRANGE GLOBAL ---
        jest.clearAllMocks();

        mockProductoRepository = {
            getProductoById: jest.fn(),
            createProducto: jest.fn(),
            updateProductoById: jest.fn(),
            deleteProductoById: jest.fn(),
            buscarProductos: jest.fn()
        };
        mockUsuarioRepository = { getUsuarioById: jest.fn() };
        mockCategoriaRepository = { getCategoriasByNombre: jest.fn() };

        productoService = new ProductoService(mockProductoRepository, mockUsuarioRepository, mockCategoriaRepository);
    });

    describe('createProducto', () => {
        const validPayload = { titulo: 'Auriculares', precio: 100, stock: 10 };

        test('Debe crear un producto con datos válidos', async () => {
            mockProductoRepository.createProducto.mockResolvedValue({ _id: productoId, ...validPayload, vendedor: vendedorId });
            const result = await productoService.createProducto(vendedorId, validPayload);
            expect(result.status).toBe(201);
            expect(mockProductoRepository.createProducto).toHaveBeenCalledWith(expect.objectContaining({
                vendedor: vendedorId,
                titulo: 'Auriculares'
            }));
        });

        test('Debe lanzar error de validación si el payload es inválido', async () => {
            await expect(productoService.createProducto(vendedorId, { titulo: 'X' })).rejects.toThrow(ProductoValidacionError);
        });
    });

    describe('getProductoById', () => {
        test('Debe obtener un producto por ID', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue({ _id: productoId, titulo: 'Auriculares' });
            const result = await productoService.getProductoById(productoId);
            expect(result.data.id).toBe(productoId);
        });

        test('Debe lanzar error si el producto no existe', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue(null);
            await expect(productoService.getProductoById(productoId)).rejects.toThrow(ProductoNoEncontradoError);
        });
    });

    describe('updateProductoById', () => {
        test('Debe actualizar un producto del propio vendedor', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue({ _id: productoId, vendedor: { _id: vendedorId }, titulo: 'Viejo' });
            mockProductoRepository.updateProductoById.mockResolvedValue({ _id: productoId, vendedor: { _id: vendedorId }, titulo: 'Nuevo' });
            const result = await productoService.updateProductoById(productoId, vendedorId, { titulo: 'Nuevo' });
            expect(result.status).toBe(200);
        });

        test('Debe lanzar error si el producto es de otro vendedor', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue({ _id: productoId, vendedor: { _id: 'otro' }, titulo: 'Viejo' });
            await expect(productoService.updateProductoById(productoId, vendedorId, { titulo: 'Nuevo' })).rejects.toThrow(UsuarioNoAutorizadoError);
        });

        test('Debe lanzar error si el producto no existe', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue(null);
            await expect(productoService.updateProductoById(productoId, vendedorId, { titulo: 'Nuevo' })).rejects.toThrow(ProductoNoEncontradoError);
        });
    });

    describe('deleteProductoById', () => {
        test('Debe dar de baja un producto del propio vendedor', async () => {
            mockProductoRepository.getProductoById.mockResolvedValue({ _id: productoId, vendedor: { _id: vendedorId } });
            mockProductoRepository.deleteProductoById.mockResolvedValue({ _id: productoId, activo: false });
            const result = await productoService.deleteProductoById(productoId, vendedorId);
            expect(result.status).toBe(200);
            expect(mockProductoRepository.deleteProductoById).toHaveBeenCalledWith(productoId);
        });
    });

    describe('buscarProductos (catálogo global)', () => {
        test('Debe devolver una página de productos de todo el marketplace', async () => {
            mockProductoRepository.buscarProductos.mockResolvedValue({
                items: [{ _id: productoId, titulo: 'Auriculares' }],
                total: 1
            });
            const result = await productoService.buscarProductos({ page: 1, limit: 10 });
            expect(result.status).toBe(200);
            expect(result.data.items).toHaveLength(1);
            expect(result.data.totalPaginas).toBe(1);
            // Sin vendedorId al ser búsqueda global
            expect(mockProductoRepository.buscarProductos).toHaveBeenCalledWith(
                expect.objectContaining({ vendedorId: undefined })
            );
        });

        test('Debe resolver el filtro de categoría por nombre', async () => {
            mockCategoriaRepository.getCategoriasByNombre.mockResolvedValue([{ _id: 'cat1' }]);
            mockProductoRepository.buscarProductos.mockResolvedValue({ items: [], total: 0 });
            await productoService.buscarProductos({ categoria: 'Electrónica' });
            expect(mockProductoRepository.buscarProductos).toHaveBeenCalledWith(
                expect.objectContaining({ categoriaId: 'cat1' })
            );
        });
    });

    describe('buscarProductosDeVendedor', () => {
        test('Debe devolver una página de productos del vendedor', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: vendedorId, tipo: 'VENDEDOR' });
            mockProductoRepository.buscarProductos.mockResolvedValue({
                items: [{ _id: productoId, titulo: 'Auriculares' }],
                total: 1
            });
            const result = await productoService.buscarProductosDeVendedor(vendedorId, { page: 1, limit: 10 });
            expect(result.status).toBe(200);
            expect(result.data.items).toHaveLength(1);
            expect(mockProductoRepository.buscarProductos).toHaveBeenCalledWith(
                expect.objectContaining({ vendedorId })
            );
        });

        test('Debe resolver categorías cuando hay término de búsqueda', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue({ _id: vendedorId });
            mockCategoriaRepository.getCategoriasByNombre.mockResolvedValue([{ _id: 'cat1' }]);
            mockProductoRepository.buscarProductos.mockResolvedValue({ items: [], total: 0 });
            await productoService.buscarProductosDeVendedor(vendedorId, { q: 'electro' });
            expect(mockCategoriaRepository.getCategoriasByNombre).toHaveBeenCalledWith('electro');
            expect(mockProductoRepository.buscarProductos).toHaveBeenCalledWith(
                expect.objectContaining({ categoriaIds: ['cat1'] })
            );
        });

        test('Debe lanzar error si el vendedor no existe', async () => {
            mockUsuarioRepository.getUsuarioById.mockResolvedValue(null);
            await expect(productoService.buscarProductosDeVendedor(vendedorId, {})).rejects.toThrow(UsuarioNoEncontradoError);
        });
    });
});
