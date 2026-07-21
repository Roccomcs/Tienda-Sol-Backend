export default {
  testEnvironment: 'node',
  transform: {},
  clearMocks: true,
  testMatch: ['**/test/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  collectCoverageFrom: [
    'src/services/**/*.js',
    'src/models/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
