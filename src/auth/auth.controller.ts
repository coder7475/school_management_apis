import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto, SignupDto } from './dto/auth.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.signin(dto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Session - valid token?
  @UseGuards(JwtAuthGuard)
  @Get('session')
  async session(@Req() req: Request) {
    const token = req?.cookies?.Authentication as string | undefined;

    if (typeof token !== 'string') {
      throw new Error('Invalid authentication token');
    }

    return this.authService.session(token);
  }
}
