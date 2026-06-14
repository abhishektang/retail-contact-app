import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { Contact } from './contact.entity';

// Chainable QueryBuilder mock
const mockQueryBuilder = {
  orderBy: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockContactsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockContact: Partial<Contact> = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@retailagent.com',
  phone: '0412345678',
  note: null,
  isVerified: false,
  createdAt: new Date('2026-01-01'),
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockContactsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockQueryBuilder.orderBy.mockReturnThis();
    mockQueryBuilder.andWhere.mockReturnThis();
    mockQueryBuilder.skip.mockReturnThis();
    mockQueryBuilder.take.mockReturnThis();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactsRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
  });

  // ─── create ───────────────────────────────────────────────────

  describe('create()', () => {
    it('creates and saves a new contact', async () => {
      mockContactsRepository.create.mockReturnValue(mockContact);
      mockContactsRepository.save.mockResolvedValue(mockContact);

      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@retailagent.com',
        phone: '0412345678',
      };

      const result = await service.create(dto as any);

      expect(mockContactsRepository.create).toHaveBeenCalledWith(dto);
      expect(mockContactsRepository.save).toHaveBeenCalledWith(mockContact);
      expect(result).toEqual(mockContact);
    });

    it('persists note when provided', async () => {
      const withNote = { ...mockContact, note: 'Interested in premium plan' };
      mockContactsRepository.create.mockReturnValue(withNote);
      mockContactsRepository.save.mockResolvedValue(withNote);

      const result = await service.create({ ...mockContact, note: 'Interested in premium plan' } as any);
      expect(result.note).toBe('Interested in premium plan');
    });
  });

  // ─── findAll ────────────────────────────────────────────────

  describe('findAll()', () => {
    it('returns paginated result with default params', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockContact], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockContact]);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 20, totalPages: 1 });
    });

    it('applies skip/take based on page and limit', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 3, limit: 10 });

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20); // (3-1)*10
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('applies ILIKE search filter across name, email, phone', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: 'john' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        { search: '%john%' },
      );
    });

    it('applies verified=true filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ verified: 'true' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.isVerified = :isVerified',
        { isVerified: true },
      );
    });

    it('applies verified=false filter', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ verified: 'false' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.isVerified = :isVerified',
        { isVerified: false },
      );
    });

    it('does not add verified where clause when verified is undefined', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ search: 'test' });

      const calls = mockQueryBuilder.andWhere.mock.calls;
      const hasVerifiedCall = calls.some(([q]) =>
        typeof q === 'string' && q.includes('isVerified'),
      );
      expect(hasVerifiedCall).toBe(false);
    });

    it('calculates totalPages correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.meta.totalPages).toBe(3); // Math.ceil(25/10)
    });

    it('returns totalPages=0 when no contacts exist', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({});

      expect(result.meta.totalPages).toBe(0);
    });
  });

  // ─── update ───────────────────────────────────────────────────

  describe('update()', () => {
    it('updates and returns the modified contact', async () => {
      const existing = { ...mockContact, isVerified: false };
      const updated = { ...existing, isVerified: true };

      mockContactsRepository.findOne.mockResolvedValue(existing);
      mockContactsRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, { isVerified: true });

      expect(mockContactsRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockContactsRepository.save).toHaveBeenCalled();
      expect(result.isVerified).toBe(true);
    });

    it('throws NotFoundException when contact does not exist', async () => {
      mockContactsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { isVerified: true })).rejects.toThrow(
        new NotFoundException('Contact with ID 999 not found'),
      );
    });
  });

  // ─── remove ───────────────────────────────────────────────────

  describe('remove()', () => {
    it('deletes the contact by id', async () => {
      mockContactsRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockContactsRepository.delete).toHaveBeenCalledWith(1);
    });

    it('throws NotFoundException when contact does not exist', async () => {
      mockContactsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Contact with ID 999 not found'),
      );
    });
  });
});
