import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Public } from './public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateBusinessDto } from './dto/create-business.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user.id);
  }

  @Post('businesses')
  createBusiness(@Req() req: any, @Body() dto: CreateBusinessDto) {
    return this.authService.createBusiness(req.user.id, dto);
  }
}
