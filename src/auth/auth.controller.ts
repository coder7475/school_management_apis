import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

// import type { Request, Response } from 'express';
// import { JwtAuthGuard } from './jwt.guard';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { parseCookieMaxAge } from 'src/utils/parseMaxAge';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseCookieMaxAge(this.config.get('JWT_ACCESS_EXPIRES_IN')),
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseCookieMaxAge(this.config.get('JWT_REFRESH_EXPIRES_IN')),
    });

    return { success: true, message: 'Login successful!', data: result };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return { success: true, message: 'Logged out successfully!', data: null };
  }

  // // Session - valid token?
  // @UseGuards(JwtAuthGuard)
  // @Get('session')
  // async session(@Req() req: Request) {
  //   const token = req?.cookies?.Authentication as string | undefined;

  //   if (typeof token !== 'string') {
  //     throw new Error('Invalid authentication token');
  //   }

  //   return this.authService.session(token);
  // }
}
