import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Contact } from './contact.entity';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockContact: Partial<Contact> = {
  id: 1,
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@retailagent.com',
  phone: '0412345678',
  note: null,
  isVerified: false,
  createdAt: new Date('2026-01-01'),
};

const paginatedResponse = {
  data: [mockContact],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe('ContactsController', () => {
  let controller: ContactsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [{ provide: ContactsService, useValue: mockService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContactsController>(ContactsController);
  });

  // ─── POST /contacts ──────────────────────────────────────────────

  describe('create()', () => {
    it('delegates to service.create and returns the new contact', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@retailagent.com',
        phone: '0412345678',
      };
      mockService.create.mockResolvedValue(mockContact);

      const result = await controller.create(dto as any);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockContact);
    });
  });

  // ─── GET /contacts ───────────────────────────────────────────────

  describe('findAll()', () => {
    it('delegates to service.findAll and returns paginated result', async () => {
      mockService.findAll.mockResolvedValue(paginatedResponse);
      const query = { page: 1, limit: 20 };

      const result = await controller.findAll(query as any);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginatedResponse);
    });

    it('passes search and verified query params through to service', async () => {
      mockService.findAll.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });
      const query = { page: 1, limit: 20, search: 'jane', verified: 'true' };

      await controller.findAll(query as any);

      expect(mockService.findAll).toHaveBeenCalledWith(query);
    });
  });

  // ─── PATCH /contacts/:id ─────────────────────────────────────────

  describe('update()', () => {
    it('delegates to service.update and returns updated contact', async () => {
      const updated = { ...mockContact, isVerified: true };
      mockService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { isVerified: true });

      expect(mockService.update).toHaveBeenCalledWith(1, { isVerified: true });
      expect(result.isVerified).toBe(true);
    });

    it('propagates NotFoundException from service', async () => {
      mockService.update.mockRejectedValue(new NotFoundException('Contact with ID 999 not found'));

      await expect(controller.update(999, { isVerified: true })).rejects.toThrow(NotFoundException);
    });
  });

  // ─── DELETE /contacts/:id ────────────────────────────────────────

  describe('remove()', () => {
    it('delegates to service.remove', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(mockService.remove).toHaveBeenCalledWith(1);
    });

    it('propagates NotFoundException from service', async () => {
      mockService.remove.mockRejectedValue(new NotFoundException('Contact with ID 999 not found'));

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
