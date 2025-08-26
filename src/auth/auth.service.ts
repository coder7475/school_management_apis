import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { type DrizzleDB } from '../drizzle/types/drizzle';
import { SignupDto } from './dto/signup.dto';
import { IResponse } from '../types/response';
import { IUser } from '../types/user';
import { users } from '../drizzle/schema/users.schema';
import { eq } from 'drizzle-orm';

function hasPgCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
  ) {}
  // Sign Up - Register
  async signup(dto: SignupDto): Promise<IResponse<IUser>> {
    const { email, password } = dto;
    // Check if user already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new BadRequestException('User already exists!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const inserted = await this.db
        .insert(users)
        .values({
          name: dto.name,
          email: dto.email,
          hashPassword: hashedPassword,
          role: dto.role,
        })
        .returning();

      const { id, name, email } = inserted[0];

      const data = {
        id,
        name,
        email,
      };

      return {
        success: true,
        message: 'User created successfully.',
        data,
      };
    } catch (err: unknown) {
      // Drizzle/pg throws a unique violation error with code '23505'
      if (hasPgCode(err) && err.code === '23505') {
        throw new BadRequestException('Email must be globally unique');
      }
      throw err;
    }
  }
  // Login
  // async signin(dto: SigninDto, res: Response) {
  //   const { user_name, password, rememberMe } = dto;

  //   const user = await this.prisma.user.findUnique({
  //     where: { user_name },
  //   });

  //   if (!user) throw new NotFoundException('User not found!');

  //   const valid = await bcrypt.compare(password, user.password);
  //   if (!valid) throw new UnauthorizedException('Incorrect password!');

  //   const payload = { sub: user.user_id, username: user.user_name };

  //   const token = await this.jwtService.signAsync(payload, {
  //     expiresIn: rememberMe ? '7d' : '30m',
  //   });

  //   res.cookie('Authentication', token, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'none',
  //     // Turn it on for production
  //     // domain: 'shops.robiulhossain.com',
  //     maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
  //   });

  //   const data = {
  //     user_name: user.user_name,
  //     createdAt: user.createdAt,
  //   };

  //   return { success: true, message: 'Login successful!', data };
  // }
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
  // async session(token: string) {
  //   let userId: string;

  //   try {
  //     const payload: JwtPayload = await this.jwtService.verifyAsync(token);
  //     userId = payload.sub;
  //   } catch (err: unknown) {
  //     Logger.error(err);
  //     throw new UnauthorizedException('Invalid or expired token');
  //   }

  //   if (!user) throw new UnauthorizedException('Session invalid');

  //   return {
  //     user_id: user.user_id,
  //     user_name: user.user_name,
  //     shops: user.shops,
  //   };
  // }
}
