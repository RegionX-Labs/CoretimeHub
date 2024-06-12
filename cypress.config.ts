import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  viewportHeight: 1080,
  viewportWidth: 1920,
});
