import { PartialType } from '@nestjs/mapped-types';
import { CreateBotApiKeyDto } from './create-bot-api-key.dto';

export class UpdateBotApiKeyDto extends PartialType(CreateBotApiKeyDto) {}
