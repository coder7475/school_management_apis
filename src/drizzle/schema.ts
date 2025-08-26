import { varchar } from 'drizzle-orm/pg-core';
import { timestamp } from 'drizzle-orm/pg-core';
import { integer } from 'drizzle-orm/pg-core';

import { uuid } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';
import { roleEnum } from './types';

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  role: roleEnum('role'),
  createdAt: timestamp('createdAt').defaultNow(),
});

// Classes table
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  section: varchar('section', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// Students table
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  age: integer('age').notNull(),
  classId: uuid('classId').references(() => classes.id),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const schema = {
  users,
  classes,
  students,
};
