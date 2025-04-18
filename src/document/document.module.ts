import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { DocumentQueryController } from './document-query.controller';
import { DocumentQueryService } from './document-query.service';

@Module({
  imports: [ConfigModule],
  controllers: [DocumentController, DocumentQueryController],
  providers: [DocumentService, DocumentQueryService],
  exports: [DocumentService, DocumentQueryService],
})
export class DocumentModule {}
