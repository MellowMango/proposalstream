import { jest } from '@jest/globals';

const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});