export default {
  presets: [
    '@babel/preset-env',  // Transpiles modern JavaScript to compatible syntax
  ],
  transform: {
    '^.+\\.js$': 'babel-jest', // Use Babel to transpile JS files
  },
  transformIgnorePatterns: [
    '/node_modules/(?!supertest)/', // Make sure supertest (or other dependencies) are transpiled if they use ESM
  ],
};
