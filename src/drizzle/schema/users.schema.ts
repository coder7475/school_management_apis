import { text } from 'drizzle-orm/pg-core';
import { timestamp, uuid, varchar, pgTable, pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['admin', 'teacher', 'student']);

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: roleEnum('role'),
  hashPassword: text('hashPassword').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});
