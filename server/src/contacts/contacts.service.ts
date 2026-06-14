import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactsRepository.create(createContactDto);
    return this.contactsRepository.save(contact);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResult<Contact>> {
    const { page = 1, limit = 20, search, verified } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.contactsRepository
      .createQueryBuilder('contact')
      .orderBy('contact.createdAt', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (verified !== undefined) {
      queryBuilder.andWhere('contact.isVerified = :isVerified', {
        isVerified: verified === 'true',
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({ where: { id } });
    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
    Object.assign(contact, updateContactDto);
    return this.contactsRepository.save(contact);
  }

  async remove(id: number): Promise<void> {
    const result = await this.contactsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }
  }
}
