import { z } from 'zod'

const text = (field: string, max: number) =>
  z
    .string({ error: `${field} must be a string` })
    .trim()
    .min(1, `${field} must not be empty`)
    .max(max, `${field} must not exceed ${max} characters`)

export const createStudentSchema = z.object({
  firstName: text('firstName', 100),
  lastName: text('lastName', 100),
  studentId: text('studentId', 50),
  dateOfBirth: z.iso.date({
    error: 'dateOfBirth must use YYYY-MM-DD format and be a valid date',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    error: 'gender must be one of: male, female, other',
  }),
})

export const updateStudentSchema = createStudentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one editable field is required',
)

export const studentIdParamSchema = z
  .string({ error: 'id must be a positive integer' })
  .regex(/^[1-9]\d*$/, 'id must be a positive integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'id is outside the supported range')
