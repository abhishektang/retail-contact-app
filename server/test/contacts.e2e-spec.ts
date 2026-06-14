import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { DataSource } from 'typeorm';
import helmet from 'helmet';

import { ContactsModule } from '../src/contacts/contacts.module';
import { HealthController } from '../src/health/health.controller';
import { Contact } from '../src/contacts/contact.entity';

// ─── Shared mock data ─────────────────────────────────────────────────

const mockContact: Contact = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@retailagent.com',
  phone: '0412345678',
  note: null,
  isVerified: false,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const mockQueryBuilder = {
  orderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockContact], 1]),
};

const mockContactRepo = {
  create: jest.fn().mockReturnValue(mockContact),
  save: jest.fn().mockResolvedValue(mockContact),
  findOne: jest.fn().mockResolvedValue(mockContact),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
};

const mockDataSource = {
  isInitialized: true,
  query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
};

// ─── Test app factory ──────────────────────────────────────────────

async function buildApp(): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([{ name: 'short', ttl: 1000, limit: 1000 }]),
      ContactsModule,
    ],
    // Register HealthController directly so DataSource can be provided here
    controllers: [HealthController],
    providers: [{ provide: DataSource, useValue: mockDataSource }],
  })
    .overrideProvider(getRepositoryToken(Contact))
    .useValue(mockContactRepo)
    .compile();

  const app = module.createNestApplication();
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.init();
  return app;
}

// ─── Tests ───────────────────────────────────────────────────────

describe('E2E — API Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-establish default mock return values after each clearAllMocks
    mockContactRepo.create.mockReturnValue(mockContact);
    mockContactRepo.save.mockResolvedValue(mockContact);
    mockContactRepo.findOne.mockResolvedValue(mockContact);
    mockContactRepo.delete.mockResolvedValue({ affected: 1 });
    mockContactRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.skip.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();
    mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockContact], 1]);
    mockDataSource.query.mockResolvedValue([{ '?column?': 1 }]);
  });

  // ─── Health ─────────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('returns 200 with healthy status', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(body.status).toBe('healthy');
      expect(body.database.connected).toBe(true);
      expect(body.database.latencyMs).toBeGreaterThanOrEqual(0);
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
    });

    it('includes helmet security headers', async () => {
      const { headers } = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBeDefined();
    });
  });

  // ─── POST /api/v1/contacts ───────────────────────────────────────

  describe('POST /api/v1/contacts', () => {
    const validBody = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@retailagent.com',
      phone: '0412345678',
    };

    it('returns 201 and the created contact', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send(validBody)
        .expect(201);

      expect(body.id).toBe(1);
      expect(body.firstName).toBe('John');
      expect(body.isVerified).toBe(false);
    });

    it('returns 400 when firstName is missing', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, firstName: undefined })
        .expect(400);

      expect(body.message).toBeDefined();
    });

    it('returns 400 when email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, email: 'not-an-email' })
        .expect(400);
    });

    it('returns 400 when phone is non-Australian', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, phone: '1234567890' })
        .expect(400);
    });

    it('returns 400 when unknown fields are sent (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, hackerField: 'pwned' })
        .expect(400);
    });

    it('strips HTML from body fields via SanitizePipe', async () => {
      // The pipe runs before the service; service receives sanitized input
      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, firstName: '<script>alert(1)</script>John' })
        .expect(201);

      const savedArg = mockContactRepo.create.mock.calls[0][0];
      expect(savedArg.firstName).not.toContain('<script>');
      expect(savedArg.firstName).toBe('John');
    });

    it('accepts an optional note field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/contacts')
        .send({ ...validBody, note: 'Interested in premium.' })
        .expect(201);
    });
  });

  // ─── GET /api/v1/contacts ────────────────────────────────────────

  describe('GET /api/v1/contacts', () => {
    it('returns 200 with paginated data structure', async () => {
      const { body } = await request(app.getHttpServer())
        .get('/api/v1/contacts')
        .expect(200);

      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.meta).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('passes search query parameter to service', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contacts?search=john')
        .expect(200);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%john%' },
      );
    });

    it('passes verified=true filter to service', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contacts?verified=true')
        .expect(200);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.isVerified = :isVerified',
        { isVerified: true },
      );
    });

    it('returns 400 when verified has an invalid value', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contacts?verified=maybe')
        .expect(400);
    });

    it('respects page and limit query params', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contacts?page=2&limit=5')
        .expect(200);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5); // (2-1)*5
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
    });

    it('returns 400 when limit exceeds maximum (100)', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/contacts?limit=200')
        .expect(400);
    });
  });

  // ─── PATCH /api/v1/contacts/:id ────────────────────────────────────

  describe('PATCH /api/v1/contacts/:id', () => {
    it('returns 200 and the updated contact', async () => {
      const verified = { ...mockContact, isVerified: true };
      mockContactRepo.save.mockResolvedValue(verified);

      const { body } = await request(app.getHttpServer())
        .patch('/api/v1/contacts/1')
        .send({ isVerified: true })
        .expect(200);

      expect(body.isVerified).toBe(true);
    });

    it('returns 404 when contact does not exist', async () => {
      mockContactRepo.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/api/v1/contacts/999')
        .send({ isVerified: true })
        .expect(404);
    });

    it('returns 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/contacts/abc')
        .send({ isVerified: true })
        .expect(400);
    });

    it('returns 400 when unknown fields are sent', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/contacts/1')
        .send({ isVerified: true, unknownField: 'x' })
        .expect(400);
    });
  });

  // ─── DELETE /api/v1/contacts/:id ───────────────────────────────────

  describe('DELETE /api/v1/contacts/:id', () => {
    it('returns 204 No Content on successful deletion', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/contacts/1')
        .expect(204);

      expect(mockContactRepo.delete).toHaveBeenCalledWith(1);
    });

    it('returns 404 when contact does not exist', async () => {
      mockContactRepo.delete.mockResolvedValue({ affected: 0 });

      await request(app.getHttpServer())
        .delete('/api/v1/contacts/999')
        .expect(404);
    });

    it('returns 400 when id is not a number', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/contacts/notanumber')
        .expect(400);
    });
  });
});
