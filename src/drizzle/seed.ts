import 'dotenv/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/schema';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

const db_url = process.env.DATABASE_URL;

if (!db_url) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: db_url,
  ssl: true,
});

// instantiate drizzle db instance
const db = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

async function main() {
  const userIds = await Promise.all(
    Array(50)
      .fill('')
      .map(async () => {
        const user = await db
          .insert(schema.users)
          .values({
            name: faker.internet.username(),
            email: faker.internet.email(),
            role: faker.helpers.arrayElement(['admin', 'teacher', 'student']),
            hashPassword: faker.internet.password(),
            createdAt: faker.date.past(),
          })
          .returning();
        return user[0].id;
      }),
  );

  const classesIds = await Promise.all(
    Array(10)
      .fill('')
      .map(async () => {
        const classRow = await db
          .insert(schema.classes)
          .values({
            name: faker.word.words({ count: 2 }),
            section: faker.string.alpha({ length: 1, casing: 'upper' }),
            createdAt: faker.date.past(),
          })
          .returning();
        return classRow[0].id;
      }),
  );

  await Promise.all(
    Array(50)
      .fill('')
      .map(async () => {
        const student = await db
          .insert(schema.students)
          .values({
            name: faker.person.fullName(),
            age: faker.number.int({ min: 6, max: 18 }),
            userId: faker.helpers.arrayElement(userIds),
            classId: faker.helpers.arrayElement(classesIds),
            createdAt: faker.date.past(),
          })
          .returning();
        return student[0].id;
      }),
  );
}

main()
  .then()
  .catch((err) => {
    Logger.error(err);
    process.exit(1);
  });
