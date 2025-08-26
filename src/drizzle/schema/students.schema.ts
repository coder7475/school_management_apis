import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './classes.schema';
import { relations } from 'drizzle-orm';

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

// realationships
export const studentRelations = relations(students, ({ one }) => ({
  users: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
}));
