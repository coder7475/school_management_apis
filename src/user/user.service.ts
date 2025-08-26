import { Inject, Injectable } from '@nestjs/common';

import { DRIZZLE } from '../drizzle/drizzle.module';
import type { DrizzleDB } from '../drizzle/types/drizzle';
import { users } from 'src/drizzle/schema/users.schema';

@Injectable()
export class UserService {
  constructor(@Inject(DRIZZLE) private db: DrizzleDB) {}

  async findAll(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const result = await this.db.query.users.findMany({
      limit,
      offset,
    });

    // Get total count of users
    const count = await this.db.$count(users);

    const total = Number(count);
    const metaData = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return {
      success: true,
      message: 'Users list retrieved successfully',
      data: result,
      metaData,
    };
  }
}
