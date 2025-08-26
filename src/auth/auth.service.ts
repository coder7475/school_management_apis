import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
import { hasPgCode } from 'src/utils/pgCode';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, Role } from './../types';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    private jwtService: JwtService,
    private config: ConfigService,
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

  // Signin - Login
  async login(dto: LoginDto) {
    const { email, password } = dto;

    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) throw new NotFoundException('User not found!');

    const valid = await bcrypt.compare(password, existingUser[0].hashPassword);
    if (!valid) throw new UnauthorizedException('Incorrect password!');

    const payload: JwtPayload = {
      sub: existingUser[0].id,
      email: existingUser[0].email,
      role: existingUser[0].role as Role,
    };

    const tokens = this.getTokens(payload);

    return tokens;
  }

  private getTokens(payload: JwtPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
    });

    return { accessToken, refreshToken };
  }

  // Refresh token verification and new access token issuance
  refresh(refreshToken: string) {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const accessToken = this.jwtService.sign(
        { email: payload.email, role: payload.role },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET'),
          subject: String(payload.sub),
          expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
        },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }
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
