import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateContactDto } from './create-contact.dto';

async function validateDto(data: object): Promise<string[]> {
  const dto = plainToInstance(CreateContactDto, data);
  const errors = await validate(dto);
  // Flatten all constraint messages for easy assertions
  return errors.map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`);
}

const validPayload = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@retailagent.com',
  phone: '0412345678',
};

describe('CreateContactDto', () => {
  // ─── Happy path ────────────────────────────────────────────────

  it('accepts a fully valid payload', async () => {
    const errors = await validateDto(validPayload);
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid payload with an optional note', async () => {
    const errors = await validateDto({ ...validPayload, note: 'Please call before noon.' });
    expect(errors).toHaveLength(0);
  });

  it('accepts when note is omitted entirely', async () => {
    const { note: _removed, ...withoutNote } = { ...validPayload, note: 'x' };
    const errors = await validateDto(withoutNote);
    expect(errors).toHaveLength(0);
  });

  // ─── firstName ─────────────────────────────────────────────────

  it('rejects missing firstName', async () => {
    const errors = await validateDto({ ...validPayload, firstName: undefined });
    expect(errors.some((e) => e.startsWith('firstName:'))).toBe(true);
  });

  it('rejects empty firstName', async () => {
    const errors = await validateDto({ ...validPayload, firstName: '' });
    expect(errors.some((e) => e.startsWith('firstName:'))).toBe(true);
  });

  it('rejects firstName shorter than 2 characters', async () => {
    const errors = await validateDto({ ...validPayload, firstName: 'J' });
    expect(errors.some((e) => e.includes('firstName'))).toBe(true);
  });

  it('rejects firstName longer than 50 characters', async () => {
    const errors = await validateDto({ ...validPayload, firstName: 'A'.repeat(51) });
    expect(errors.some((e) => e.includes('firstName'))).toBe(true);
  });

  it('accepts firstName exactly 2 characters', async () => {
    const errors = await validateDto({ ...validPayload, firstName: 'Jo' });
    expect(errors).toHaveLength(0);
  });

  it('accepts firstName exactly 50 characters', async () => {
    const errors = await validateDto({ ...validPayload, firstName: 'A'.repeat(50) });
    expect(errors).toHaveLength(0);
  });

  // ─── lastName ─────────────────────────────────────────────────

  it('rejects missing lastName', async () => {
    const errors = await validateDto({ ...validPayload, lastName: undefined });
    expect(errors.some((e) => e.startsWith('lastName:'))).toBe(true);
  });

  it('rejects lastName shorter than 2 characters', async () => {
    const errors = await validateDto({ ...validPayload, lastName: 'D' });
    expect(errors.some((e) => e.includes('lastName'))).toBe(true);
  });

  it('rejects lastName longer than 50 characters', async () => {
    const errors = await validateDto({ ...validPayload, lastName: 'Z'.repeat(51) });
    expect(errors.some((e) => e.includes('lastName'))).toBe(true);
  });

  // ─── email ───────────────────────────────────────────────────

  it('rejects an invalid email address', async () => {
    const errors = await validateDto({ ...validPayload, email: 'not-an-email' });
    expect(errors.some((e) => e.startsWith('email:'))).toBe(true);
  });

  it('rejects email without domain', async () => {
    const errors = await validateDto({ ...validPayload, email: 'user@' });
    expect(errors.some((e) => e.startsWith('email:'))).toBe(true);
  });

  it('rejects missing email', async () => {
    const errors = await validateDto({ ...validPayload, email: undefined });
    expect(errors.some((e) => e.startsWith('email:'))).toBe(true);
  });

  it('rejects email longer than 255 characters', async () => {
    const long = `${'a'.repeat(246)}@test.com`; // 256 chars total
    const errors = await validateDto({ ...validPayload, email: long });
    expect(errors.some((e) => e.startsWith('email:'))).toBe(true);
  });

  // ─── phone ───────────────────────────────────────────────────

  it('rejects a non-Australian phone number', async () => {
    const errors = await validateDto({ ...validPayload, phone: '1234567890' });
    expect(errors.some((e) => e.startsWith('phone:'))).toBe(true);
  });

  it('rejects missing phone', async () => {
    const errors = await validateDto({ ...validPayload, phone: undefined });
    expect(errors.some((e) => e.startsWith('phone:'))).toBe(true);
  });

  it('accepts a valid Australian mobile (04xx xxx xxx)', async () => {
    const errors = await validateDto({ ...validPayload, phone: '0412 345 678' });
    expect(errors).toHaveLength(0);
  });

  it('accepts +61 international prefix mobile', async () => {
    const errors = await validateDto({ ...validPayload, phone: '+61412345678' });
    expect(errors).toHaveLength(0);
  });

  it('accepts a valid Australian landline (02 xxxx xxxx)', async () => {
    const errors = await validateDto({ ...validPayload, phone: '0298765432' });
    expect(errors).toHaveLength(0);
  });

  it('accepts a 1800 toll-free number', async () => {
    const errors = await validateDto({ ...validPayload, phone: '1800123456' });
    expect(errors).toHaveLength(0);
  });

  // ─── note ────────────────────────────────────────────────────

  it('rejects note longer than 1000 characters', async () => {
    const errors = await validateDto({ ...validPayload, note: 'x'.repeat(1001) });
    expect(errors.some((e) => e.startsWith('note:'))).toBe(true);
  });

  it('accepts note exactly 1000 characters', async () => {
    const errors = await validateDto({ ...validPayload, note: 'x'.repeat(1000) });
    expect(errors).toHaveLength(0);
  });

  it('accepts an empty string note', async () => {
    const errors = await validateDto({ ...validPayload, note: '' });
    expect(errors).toHaveLength(0);
  });
});
