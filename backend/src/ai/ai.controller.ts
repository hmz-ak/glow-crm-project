import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { MessageSuggestionDto } from './dto/message-suggestion.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('message-suggestion')
  suggestMessage(@Body() dto: MessageSuggestionDto) {
    return this.aiService.suggestMessage(dto);
  }
}
