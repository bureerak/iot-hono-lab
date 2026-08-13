import { Hono } from 'hono'
import {
  createStudent,
  deleteStudent,
  getStudent,
  updateStudent,
} from '../controller/student_controller.js'

const student = new Hono()

student.post('/', createStudent)
student.get('/:id', getStudent)
student.patch('/:id', updateStudent)
student.delete('/:id', deleteStudent)

export default student
