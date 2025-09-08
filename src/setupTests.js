import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Chrome extension APIs
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn()
    }
  },
  runtime: {
    getManifest: vi.fn(() => ({ version: '1.0.0' }))
  }
};

// Mock p5.js for testing
vi.mock('p5', () => ({
  default: vi.fn()
}));

// Mock react-p5-wrapper
vi.mock('react-p5-wrapper', () => ({
  ReactP5Wrapper: vi.fn(({ sketch, ...props }) => {
    return React.createElement('div', { 'data-testid': 'p5-canvas', ...props });
  })
}));
