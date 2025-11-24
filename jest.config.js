module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/server/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
