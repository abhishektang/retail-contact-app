import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './contact.entity';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll(): Promise<Contact[]> {
    return this.contactsService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ): Promise<Contact> {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contactsService.remove(id);
  }
}
