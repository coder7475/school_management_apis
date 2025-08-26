import { Inject, Injectable } from '@nestjs/common';

import { DRIZZLE } from '../drizzle/drizzle.module';
import type { DrizzleDB } from '../drizzle/types/drizzle';

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll() {
    // return await this.db.select().from(users);
    return await this.db.query.users.findMany();
  }
}
