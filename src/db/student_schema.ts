import { date, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  studentId: varchar('student_id', { length: 50 }).notNull().unique(),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: text('gender', { enum: ['male', 'female', 'other'] }).notNull(),
})
