import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de SpeechSynthesis
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      onvoiceschanged: vi.fn(),
      getVoices: vi.fn(() => []),
    },
  });

  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: vi.fn(),
  });
}
