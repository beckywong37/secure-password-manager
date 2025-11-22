import { beforeEach } from 'vitest';

// Setup jsdom environment properly
beforeEach(() => {
  // Reset document.cookie before each test
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
});

