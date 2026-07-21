import { ItemPedido } from '../../models/ItemPedido.js';

describe('ItemPedido Model', () => {
    test('subtotal debería multiplicar precio unitario por cantidad', () => {
        const item = new ItemPedido({ id: 'p1' }, 3, 150);
        expect(item.subtotal()).toBe(450);
    });

    test('subtotal debería ser 0 si la cantidad es 0', () => {
        const item = new ItemPedido({ id: 'p1' }, 0, 150);
        expect(item.subtotal()).toBe(0);
    });
});
