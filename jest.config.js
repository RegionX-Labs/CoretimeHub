module.exports = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    // If you're using absolute imports or path aliases, set them up here
  },
  testEnvironment: 'jsdom', // or "node", depending on your project needs
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Ensure this matches the structure defined in tsconfig.json
  },
};
