import { varchar } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { pgEnum } from 'drizzle-orm/pg-core';
import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

// role enum
export const roleEnum = pgEnum('role', ['admin', 'teacher', 'student']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: roleEnum('role'),
  createdAt: timestamp('created_at').defaultNow(),
});
