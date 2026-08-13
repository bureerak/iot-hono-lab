import {
  studentRepository,
  type CreateStudentData,
  type Student,
  type UpdateStudentData,
} from '../repository/student_repository.js'

const genders = ['male', 'female', 'other'] as const
const editableFields = [
  'firstName',
  'lastName',
  'studentId',
  'dateOfBirth',
  'gender',
] as const

type Gender = (typeof genders)[number]
type ValidationResult<T> = { data: T } | { error: string }
type StudentServiceErrorCode =
  | 'VALIDATION_ERROR'
  | 'STUDENT_NOT_FOUND'
  | 'STUDENT_ID_CONFLICT'

export class StudentServiceError extends Error {
  constructor(
    readonly code: StudentServiceErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'StudentServiceError'
  }
}

function validationError(message: string): never {
  throw new StudentServiceError('VALIDATION_ERROR', message)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(
  value: unknown,
  field: string,
  maxLength: number,
): ValidationResult<string> {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return { error: `${field} must be a non-empty string` }
  }

  const text = value.trim()
  if (text.length > maxLength) {
    return { error: `${field} must not exceed ${maxLength} characters` }
  }

  return { data: text }
}

function readDate(value: unknown): ValidationResult<string> {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: 'dateOfBirth must use YYYY-MM-DD format' }
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== value
  ) {
    return { error: 'dateOfBirth must be a valid date' }
  }

  return { data: value }
}

function readGender(value: unknown): ValidationResult<Gender> {
  if (typeof value !== 'string' || !genders.includes(value as Gender)) {
    return { error: `gender must be one of: ${genders.join(', ')}` }
  }

  return { data: value as Gender }
}

function requireValue<T>(result: ValidationResult<T>): T {
  if ('error' in result) validationError(result.error)
  return result.data
}

function validateCreateData(body: unknown): CreateStudentData {
  if (!isRecord(body)) validationError('Request body must be a JSON object')

  return {
    firstName: requireValue(readText(body.firstName, 'firstName', 100)),
    lastName: requireValue(readText(body.lastName, 'lastName', 100)),
    studentId: requireValue(readText(body.studentId, 'studentId', 50)),
    dateOfBirth: requireValue(readDate(body.dateOfBirth)),
    gender: requireValue(readGender(body.gender)),
  }
}

function validateUpdateData(body: unknown): UpdateStudentData {
  if (!isRecord(body)) validationError('Request body must be a JSON object')

  if (!editableFields.some((field) => field in body)) {
    validationError(
      `At least one editable field is required: ${editableFields.join(', ')}`,
    )
  }

  const data: UpdateStudentData = {}

  if ('firstName' in body) {
    data.firstName = requireValue(readText(body.firstName, 'firstName', 100))
  }
  if ('lastName' in body) {
    data.lastName = requireValue(readText(body.lastName, 'lastName', 100))
  }
  if ('studentId' in body) {
    data.studentId = requireValue(readText(body.studentId, 'studentId', 50))
  }
  if ('dateOfBirth' in body) {
    data.dateOfBirth = requireValue(readDate(body.dateOfBirth))
  }
  if ('gender' in body) {
    data.gender = requireValue(readGender(body.gender))
  }

  return data
}

function parseId(value: string | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    validationError('id must be a positive integer')
  }

  const id = Number(value)
  if (!Number.isSafeInteger(id)) {
    validationError('id is outside the supported range')
  }

  return id
}

function hasDatabaseCode(error: unknown, code: string): boolean {
  return isRecord(error) && error.code === code
}

async function create(body: unknown): Promise<Student> {
  const data = validateCreateData(body)

  try {
    return await studentRepository.create(data)
  } catch (error) {
    if (hasDatabaseCode(error, '23505')) {
      throw new StudentServiceError(
        'STUDENT_ID_CONFLICT',
        'studentId already exists',
      )
    }
    throw error
  }
}

async function getById(idValue: string | undefined): Promise<Student> {
  const student = await studentRepository.findById(parseId(idValue))
  if (!student) {
    throw new StudentServiceError('STUDENT_NOT_FOUND', 'Student not found')
  }
  return student
}

async function update(
  idValue: string | undefined,
  body: unknown,
): Promise<Student> {
  const id = parseId(idValue)
  const data = validateUpdateData(body)

  try {
    const student = await studentRepository.updateById(id, data)
    if (!student) {
      throw new StudentServiceError('STUDENT_NOT_FOUND', 'Student not found')
    }
    return student
  } catch (error) {
    if (hasDatabaseCode(error, '23505')) {
      throw new StudentServiceError(
        'STUDENT_ID_CONFLICT',
        'studentId already exists',
      )
    }
    throw error
  }
}

async function deleteStudent(idValue: string | undefined): Promise<Student> {
  const student = await studentRepository.deleteById(parseId(idValue))
  if (!student) {
    throw new StudentServiceError('STUDENT_NOT_FOUND', 'Student not found')
  }
  return student
}

export const studentService = {
  create,
  getById,
  update,
  delete: deleteStudent,
}
