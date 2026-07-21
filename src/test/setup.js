import { jest } from '@jest/globals';

globalThis.jest = {
  fn: jest.fn,
  spyOn: jest.spyOn,
  mock: jest.mock,
  unmock: jest.unmock,
  clearAllMocks: jest.clearAllMocks
};

// Variables de entorno necesarias para los tests de la capa de servicios (JWT)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-test';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
