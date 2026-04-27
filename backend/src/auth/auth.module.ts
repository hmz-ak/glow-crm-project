import { Module } from '@nestjs/common';
import { AuditsModule } from '../audits/audits.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [AuditsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
