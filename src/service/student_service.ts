import {
  studentRepository,
  type Student,
} from '../repository/student_repository.js'
import {
  createStudentSchema,
  studentIdParamSchema,
  updateStudentSchema,
} from '../validator/student_validator.js'

type StudentServiceErrorCode = 'STUDENT_NOT_FOUND' | 'STUDENT_ID_CONFLICT'

export class StudentServiceError extends Error {
  constructor(
    readonly code: StudentServiceErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'StudentServiceError'
  }
}

function requireStudent(student: Student | undefined): Student {
  if (!student) {
    throw new StudentServiceError('STUDENT_NOT_FOUND', 'Student not found')
  }
  return student
}

async function handleStudentIdConflict<T>(query: Promise<T>): Promise<T> {
  try {
    return await query
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === '23505'
    ) {
      throw new StudentServiceError(
        'STUDENT_ID_CONFLICT',
        'studentId already exists',
      )
    }
    throw error
  }
}

async function create(body: unknown): Promise<Student> {
  return handleStudentIdConflict(
    studentRepository.create(createStudentSchema.parse(body)),
  )
}

async function getById(idValue: string | undefined): Promise<Student> {
  return requireStudent(
    await studentRepository.findById(studentIdParamSchema.parse(idValue)),
  )
}

async function update(
  idValue: string | undefined,
  body: unknown,
): Promise<Student> {
  const id = studentIdParamSchema.parse(idValue)
  const data = updateStudentSchema.parse(body)

  return requireStudent(
    await handleStudentIdConflict(studentRepository.updateById(id, data)),
  )
}

async function deleteStudent(idValue: string | undefined): Promise<Student> {
  return requireStudent(
    await studentRepository.deleteById(studentIdParamSchema.parse(idValue)),
  )
}

export const studentService = {
  create,
  getById,
  update,
  delete: deleteStudent,
}
