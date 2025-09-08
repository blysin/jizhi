import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CanvasAnimation from '../CanvasAnimation';

// Mock Canvas API
class MockCanvasRenderingContext2D {
  constructor() {
    this.fillStyle = '';
    this.strokeStyle = '';
    this.lineWidth = 1;
  }
  
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  fill() {}
  stroke() {}
  clearRect() {}
  fillRect() {}
  save() {}
  restore() {}
  translate() {}
  scale() {}
  setTransform() {}
  getImageData() { return { data: [] }; }
  putImageData() {}
}

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => new MockCanvasRenderingContext2D()),
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    top: 0,
    left: 0,
    width: 800,
    height: 600,
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

describe('CanvasAnimation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders canvas element', () => {
    render(<CanvasAnimation animationType="waves" />);
    const canvas = screen.getByLabelText('waves animation canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  test('renders with default props', () => {
    render(<CanvasAnimation />);
    const canvas = screen.getByLabelText('waves animation canvas');
    expect(canvas).toBeInTheDocument();
  });

  test('applies custom className and style', () => {
    render(
      <CanvasAnimation 
        className="test-class"
        style={{ backgroundColor: 'red' }}
      />
    );
    const canvas = screen.getByLabelText('waves animation canvas');
    expect(canvas).toHaveClass('test-class');
    expect(canvas).toHaveStyle({ backgroundColor: 'red' });
  });
});

describe('CanvasAnimation Integration', () => {
  test('canvas has correct styling for background animation', () => {
    render(<CanvasAnimation animationType="blobs" />);
    const canvas = screen.getByLabelText('blobs animation canvas');
    
    expect(canvas).toHaveStyle({
      position: 'fixed',
      top: '0px',
      left: '0px',
      zIndex: '-1',
    });
  });
});