import { Module } from '@nestjs/common';
import { FileProcessedMessagesService } from './file-processed-messages.service';
import { FileProcessedMessagesController } from './file-processed-messages.controller';

@Module({
  providers: [FileProcessedMessagesService],
  controllers: [FileProcessedMessagesController]
})
export class FileProcessedMessagesModule {}
