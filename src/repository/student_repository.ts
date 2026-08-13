import { sql } from 'drizzle-orm'
import db from '../db/db.js'
import { students } from '../db/student_schema.js'

export type Student = typeof students.$inferSelect
export type CreateStudentData = typeof students.$inferInsert
export type UpdateStudentData = Partial<Omit<CreateStudentData, 'id'>>

async function create(data: CreateStudentData): Promise<Student> {
  const [student] = await db.insert(students).values(data).returning()
  return student
}

async function findById(id: number): Promise<Student | undefined> {
  const [student] = await db
    .select()
    .from(students)
    .where(sql`${students.id} = ${id}`)
    .limit(1)

  return student
}

async function updateById(
  id: number,
  data: UpdateStudentData,
): Promise<Student | undefined> {
  const [student] = await db
    .update(students)
    .set(data)
    .where(sql`${students.id} = ${id}`)
    .returning()

  return student
}

async function deleteById(id: number): Promise<Student | undefined> {
  const [student] = await db
    .delete(students)
    .where(sql`${students.id} = ${id}`)
    .returning()

  return student
}

export const studentRepository = {
  create,
  findById,
  updateById,
  deleteById,
}
