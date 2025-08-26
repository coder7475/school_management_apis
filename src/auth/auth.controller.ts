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

// import type { Request, Response } from 'express';
// import { JwtAuthGuard } from './jwt.guard';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { parseCookieMaxAge } from '../utils/parseMaxAge';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt.guard';

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
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { success: true, message: 'Logged out successfully!', data: null };
  }

  // Accept refresh token from cookie or body
  @Post('refresh-token')
  refresh(
    @Body('refreshToken') bodyToken: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cookieToken: string | undefined =
      typeof req.cookies?.refreshToken === 'string'
        ? req.cookies.refreshToken
        : undefined;

    const token: string | undefined =
      typeof bodyToken === 'string' && bodyToken.length > 0
        ? bodyToken
        : cookieToken;

    if (!token) {
      return { message: 'No refresh token provided' };
    }

    const newAccessToken = this.authService.refresh(token);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: parseCookieMaxAge(this.config.get('JWT_ACCESS_EXPIRES_IN')),
    });

    return {
      success: true,
      message: 'New Access token Issued!',
      data: newAccessToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    // user attached by JwtStrategy.validate
    return req.user;
  }
}
