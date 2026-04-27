import { AiService } from './ai.service';

describe('AiService', () => {
  it('returns deterministic WhatsApp/SMS-style message suggestions', () => {
    const service = new AiService();
    const result = service.suggestMessage({
      customerName: 'Amina',
      serviceType: 'hair color',
      intent: 'booking-reminder',
      businessName: 'Glow Studio',
    });

    expect(result.generatedBy).toBe('template-ai');
    expect(result.message).toContain('Amina');
    expect(result.message).toContain('hair color');
  });
});
