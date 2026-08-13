import type { Context } from 'hono'
import {
  StudentServiceError,
  studentService,
} from '../service/student_service.js'

function handleError(c: Context, error: unknown) {
  if (error instanceof StudentServiceError) {
    const status = {
      VALIDATION_ERROR: 400,
      STUDENT_NOT_FOUND: 404,
      STUDENT_ID_CONFLICT: 409,
    }[error.code] as 400 | 404 | 409

    return c.json({ error: error.message }, status)
  }

  console.error('Student operation failed', error)
  return c.json({ error: 'Internal server error' }, 500)
}

async function readJson(c: Context) {
  try {
    return { body: await c.req.json<unknown>() }
  } catch {
    return { error: 'Request body must contain valid JSON' }
  }
}

export async function createStudent(c: Context) {
  const json = await readJson(c)
  if ('error' in json) return c.json({ error: json.error }, 400)

  try {
    const student = await studentService.create(json.body)
    return c.json(student, 201)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function getStudent(c: Context) {
  try {
    const student = await studentService.getById(c.req.param('id'))
    return c.json(student)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function updateStudent(c: Context) {
  const json = await readJson(c)
  if ('error' in json) return c.json({ error: json.error }, 400)

  try {
    const student = await studentService.update(c.req.param('id'), json.body)
    return c.json(student)
  } catch (error) {
    return handleError(c, error)
  }
}

export async function deleteStudent(c: Context) {
  try {
    const student = await studentService.delete(c.req.param('id'))
    return c.json(student)
  } catch (error) {
    return handleError(c, error)
  }
}
