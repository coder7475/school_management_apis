import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { SigninDto, SignupDto } from './dto/login.dto';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.strategy';
import { IResponse } from 'src/common/interfaces/response.interface';
import { IUser } from './interface/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  // signUp - Register
  async signup(dto: SignupDto): Promise<IResponse<IUser>> {
    const { user_name, password, shopNames } = dto;

    if (!user_name) {
      throw new Error('user_name is required');
    }

    const isUserExits = await this.prisma.user.findUnique({
      where: { user_name },
    });

    if (isUserExits) {
      throw new BadRequestException('Username Unavailable!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          user_name,
          password: hashedPassword,
          shops: {
            create: shopNames.map((name) => ({ shop_name: name })),
          },
        },
        include: { shops: true },
      });
      const { user_id, shops, createdAt } = user;
      const data = {
        user_id,
        user_name,
        shops,
        createdAt,
      };

      return {
        success: true,
        message: 'User created Successfully.',
        data,
      };
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException('Shop name must be globally unique');
      }
      throw err;
    }
  }
  // Login
  async signin(dto: SigninDto, res: Response) {
    const { user_name, password, rememberMe } = dto;

    const user = await this.prisma.user.findUnique({
      where: { user_name },
    });

    if (!user) throw new NotFoundException('User not found!');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Incorrect password!');

    const payload = { sub: user.user_id, username: user.user_name };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: rememberMe ? '7d' : '30m',
    });

    res.cookie('Authentication', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      // Turn it on for production
      // domain: 'shops.robiulhossain.com',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
    });

    const data = {
      user_name: user.user_name,
      createdAt: user.createdAt,
    };

    return { success: true, message: 'Login successful!', data };
  }
  // Logout
  logout(res: Response) {
    res.clearCookie('Authentication', {
      // domain: process.env.COOKIE_DOMAIN,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return { success: true, message: 'Logged out successfully!', data: null };
  }

  // Session - valid token?
  async session(token: string) {
    let userId: string;

    try {
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);
      userId = payload.sub;
    } catch (err: unknown) {
      Logger.error(err);
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!user) throw new UnauthorizedException('Session invalid');

    return {
      user_id: user.user_id,
      user_name: user.user_name,
      shops: user.shops,
    };
  }
}
