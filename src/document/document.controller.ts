import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { Express } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('botId') botId: string,
  ) {
    console.log('Received file:', file ? file.originalname : 'No file received');
    console.log('Received botId:', botId);
    const botIdNum = parseInt(botId) || 1;
    return this.documentService.uploadFile(file, botIdNum);
  }

  @Get()
  findAll(@Query('botId') botId?: number) {
    return this.documentService.findAll(botId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }

  @Get('bot/:botId')
  findByBotId(@Param('botId') botId: number) {
    return this.documentService.findByBotId(botId);
  }
}