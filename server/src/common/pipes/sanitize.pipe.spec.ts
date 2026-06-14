import { ArgumentMetadata } from '@nestjs/common';
import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  const bodyMeta: ArgumentMetadata = { type: 'body', metatype: Object, data: '' };
  const queryMeta: ArgumentMetadata = { type: 'query', metatype: Object, data: '' };
  const paramMeta: ArgumentMetadata = { type: 'param', metatype: String, data: 'id' };

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  // ─── Non-body passthrough ────────────────────────────────────────

  it('passes through query params unchanged (no sanitization)', () => {
    const value = { search: '<b>test</b>' };
    const result = pipe.transform(value, queryMeta);
    expect(result).toBe(value); // exact same reference
  });

  it('passes through path params unchanged', () => {
    const result = pipe.transform('42', paramMeta);
    expect(result).toBe('42');
  });

  // ─── Null / primitive body guards ────────────────────────────────────

  it('passes through null body unchanged', () => {
    expect(pipe.transform(null, bodyMeta)).toBeNull();
  });

  it('passes through a string body unchanged (not an object)', () => {
    expect(pipe.transform('raw string', bodyMeta)).toBe('raw string');
  });

  // ─── HTML stripping ───────────────────────────────────────────────

  it('strips <script> tags from string fields', () => {
    const result = pipe.transform(
      { firstName: '<script>alert("xss")</script>John' },
      bodyMeta,
    );
    expect(result.firstName).toBe('John');
    expect(result.firstName).not.toContain('<script>');
  });

  it('strips <img> tags', () => {
    const result = pipe.transform(
      { note: '<img src="x" onerror="evil()">Hello' },
      bodyMeta,
    );
    expect(result.note).toBe('Hello');
  });

  it('strips <a> tags but retains link text', () => {
    const result = pipe.transform(
      { note: '<a href="http://evil.com">click me</a>' },
      bodyMeta,
    );
    expect(result.note).toBe('click me');
  });

  it('strips <b> and other formatting tags', () => {
    const result = pipe.transform(
      { firstName: '<b>Bold</b> <em>Text</em>' },
      bodyMeta,
    );
    expect(result.firstName).toBe('Bold Text');
  });

  it('handles HTML entity injection attempts', () => {
    const result = pipe.transform(
      { firstName: '&lt;script&gt;' },
      bodyMeta,
    );
    // sanitize-html decodes entities — result should not contain executable script
    expect(result.firstName).not.toContain('<script>');
  });

  // ─── Trim whitespace ───────────────────────────────────────────

  it('trims leading and trailing whitespace after stripping', () => {
    const result = pipe.transform({ firstName: '  John  ' }, bodyMeta);
    expect(result.firstName).toBe('John');
  });

  it('trims whitespace left behind by stripped tags', () => {
    const result = pipe.transform(
      { note: '<p>  </p>  text  ' },
      bodyMeta,
    );
    expect(result.note).toBe('text');
  });

  // ─── Non-string primitives ──────────────────────────────────────

  it('preserves boolean values unchanged', () => {
    const result = pipe.transform({ isVerified: true }, bodyMeta);
    expect(result.isVerified).toBe(true);
  });

  it('preserves number values unchanged', () => {
    const result = pipe.transform({ count: 42 }, bodyMeta);
    expect(result.count).toBe(42);
  });

  it('preserves null field values unchanged', () => {
    const result = pipe.transform({ note: null }, bodyMeta);
    expect(result.note).toBeNull();
  });

  // ─── Nested objects ────────────────────────────────────────────

  it('sanitizes string fields inside nested objects', () => {
    const result = pipe.transform(
      { meta: { tag: '<b>hello</b>' } },
      bodyMeta,
    );
    expect(result.meta.tag).toBe('hello');
  });

  // ─── Clean inputs unchanged ─────────────────────────────────────

  it('leaves clean strings unchanged', () => {
    const result = pipe.transform(
      { firstName: 'John', lastName: 'Doe', email: 'john@retailagent.com' },
      bodyMeta,
    );
    expect(result.firstName).toBe('John');
    expect(result.lastName).toBe('Doe');
    expect(result.email).toBe('john@retailagent.com');
  });
});
