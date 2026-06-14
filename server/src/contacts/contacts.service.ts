import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

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

  async findAll(): Promise<Contact[]> {
    return this.contactsRepository.find({
      order: { createdAt: 'DESC' },
    });
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
