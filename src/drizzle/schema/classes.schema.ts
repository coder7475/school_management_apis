import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { students } from './students.schema';
import { relations } from 'drizzle-orm';

// Classes table
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  section: varchar('section', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

// realationships
export const classesRelations = relations(classes, ({ many }) => ({
  students: many(students),
}));
