import { describe, it, expect } from 'vitest';
import { loadPrompt } from '../loader';

describe('loadPrompt', () => {
  it('loads the current version and substitutes variables', () => {
    const result = loadPrompt('answer', 'fr', {
      context: 'Article 35 du Code du Travail...',
      question: 'Quelle est la durée du préavis ?',
    });

    expect(result).toContain('Article 35 du Code du Travail...');
    expect(result).toContain('Quelle est la durée du préavis ?');
    expect(result).not.toContain('{{context}}');
    expect(result).not.toContain('{{question}}');
  });

  it('loads a specific version', () => {
    const result = loadPrompt(
      'answer',
      'ar',
      { context: 'سياق قانوني', question: 'ما هي مدة الإشعار؟' },
      'v1',
    );

    expect(result).toContain('سياق قانوني');
    expect(result).toContain('ما هي مدة الإشعار؟');
  });

  it('throws on missing variables', () => {
    expect(() => loadPrompt('answer', 'fr', { context: 'some context' })).toThrow(
      'Missing prompt variables: question',
    );
  });

  it('throws on non-existent prompt', () => {
    expect(() =>
      loadPrompt('nonexistent', 'fr', {}),
    ).toThrow();
  });
});
