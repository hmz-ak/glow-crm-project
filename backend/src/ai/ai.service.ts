import { Injectable } from '@nestjs/common';
import { MessageSuggestionDto } from './dto/message-suggestion.dto';

@Injectable()
export class AiService {
  suggestMessage(dto: MessageSuggestionDto) {
    const business = dto.businessName ?? 'our team';
    const intent = dto.intent ?? 'new-lead';
    const templates: Record<string, string> = {
      'new-lead': `Hi ${dto.customerName}, thanks for reaching out about ${dto.serviceType}. This is ${business}. I can help you pick a slot and share the price details here.`,
      'booking-reminder': `Hi ${dto.customerName}, quick reminder for your ${dto.serviceType} booking. Reply here if you need to adjust the time.`,
      'payment-due': `Hi ${dto.customerName}, thank you for choosing ${business}. Your ${dto.serviceType} payment is still pending. Would you like the payment details again?`,
      'win-back': `Hi ${dto.customerName}, we still have a few openings for ${dto.serviceType} this week. Would you like me to hold one for you?`,
      'thank-you': `Hi ${dto.customerName}, thank you for visiting ${business} for ${dto.serviceType}. We would love to see you again when you are ready.`,
    };

    return {
      message: templates[intent],
      channel: 'WhatsApp/SMS',
      generatedBy: 'template-ai',
    };
  }
}
