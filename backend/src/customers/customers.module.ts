import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [AuditsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
