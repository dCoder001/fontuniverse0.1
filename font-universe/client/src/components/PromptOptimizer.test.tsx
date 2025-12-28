import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptOptimizer } from './PromptOptimizer';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

describe('PromptOptimizer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
    // Mock scrollIntoView since it's not implemented in jsdom
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders correctly', () => {
    render(<PromptOptimizer />);
    expect(screen.getByText('Prompt Optimizer')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your prompt here...')).toBeInTheDocument();
  });

  it('handles successful optimization', async () => {
    const mockResponse = {
      original: 'test prompt',
      optimized: 'optimized prompt result',
      changes: ['change 1', 'change 2']
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<PromptOptimizer />);
    
    const textarea = screen.getByPlaceholderText('Enter your prompt here...');
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    
    const button = screen.getByRole('button', { name: /Optimize/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('optimized prompt result')).toBeInTheDocument();
    });
    
    expect(screen.getByText('change 1')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

    render(<PromptOptimizer />);
    
    const textarea = screen.getByPlaceholderText('Enter your prompt here...');
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    
    const button = screen.getByRole('button', { name: /Optimize/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/AI Service unavailable/i)).toBeInTheDocument();
    });
  });

  it('handles invalid API response format (missing changes)', async () => {
     const mockResponse = {
      original: 'test prompt',
      optimized: 'optimized prompt',
      // changes missing
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    render(<PromptOptimizer />);
    
    const textarea = screen.getByPlaceholderText('Enter your prompt here...');
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    
    const button = screen.getByRole('button', { name: /Optimize/i });
    fireEvent.click(button);

    // Should trigger fallback because validation fails
    await waitFor(() => {
      expect(screen.getByText(/AI Service unavailable/i)).toBeInTheDocument();
    });
  });
});
