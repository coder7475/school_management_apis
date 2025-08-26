import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', ctx.getHandler());
    console.log('required: ', required);
    if (!required || required.length === 0) return true;

    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user as JwtPayload | undefined;
    console.log('user: ', user);
    console.log('role: ', user?.role);
    if (!user || !user.role) return false;

    return required.includes(user.role);
  }
}
