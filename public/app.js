const API_BASE = '/api/student'

const elements = {
  studentForm: document.querySelector('#student-form'),
  editingId: document.querySelector('#editing-id'),
  firstName: document.querySelector('#first-name'),
  lastName: document.querySelector('#last-name'),
  studentId: document.querySelector('#student-id'),
  dateOfBirth: document.querySelector('#date-of-birth'),
  gender: document.querySelector('#gender'),
  formMode: document.querySelector('#form-mode'),
  formTitle: document.querySelector('#form-title'),
  submitButton: document.querySelector('#submit-button'),
  submitButtonText: document.querySelector('#submit-button span'),
  resetButton: document.querySelector('#reset-button'),
  cancelEditButton: document.querySelector('#cancel-edit-button'),
  lookupForm: document.querySelector('#lookup-form'),
  lookupId: document.querySelector('#lookup-id'),
  lookupButton: document.querySelector('#lookup-button'),
  emptyState: document.querySelector('#empty-state'),
  studentCard: document.querySelector('#student-card'),
  studentAvatar: document.querySelector('#student-avatar'),
  resultName: document.querySelector('#result-name'),
  resultStudentId: document.querySelector('#result-student-id'),
  resultId: document.querySelector('#result-id'),
  resultDateOfBirth: document.querySelector('#result-date-of-birth'),
  resultGender: document.querySelector('#result-gender'),
  editButton: document.querySelector('#edit-button'),
  deleteButton: document.querySelector('#delete-button'),
  responseMeta: document.querySelector('#response-meta'),
  responseMethod: document.querySelector('#response-method'),
  responsePath: document.querySelector('#response-path'),
  responseStatus: document.querySelector('#response-status'),
  responseTime: document.querySelector('#response-time'),
  responseOutput: document.querySelector('#response-output code'),
  toast: document.querySelector('#toast'),
}

const genderLabels = {
  male: 'ชาย',
  female: 'หญิง',
  other: 'อื่น ๆ',
}

let selectedStudent = null
let toastTimer

elements.dateOfBirth.max = new Date().toISOString().slice(0, 10)

function setLoading(button, isLoading) {
  button.disabled = isLoading
  button.setAttribute('aria-busy', String(isLoading))
}

function showToast(message, type = 'success') {
  clearTimeout(toastTimer)
  elements.toast.textContent = message
  elements.toast.classList.toggle('error', type === 'error')
  elements.toast.classList.add('show')
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 3200)
}

function showResponse(method, path, status, duration, data) {
  elements.responseMeta.classList.remove('hidden')
  elements.responseMethod.textContent = method
  elements.responsePath.textContent = path
  elements.responseStatus.textContent = String(status)
  elements.responseStatus.classList.toggle('error', status >= 400)
  elements.responseTime.textContent = `${duration} ms`
  elements.responseOutput.textContent =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2)
}

async function requestApi(path, options = {}) {
  const method = options.method || 'GET'
  const startedAt = performance.now()
  let response

  try {
    response = await fetch(path, {
      ...options,
      headers: options.body
        ? { 'Content-Type': 'application/json', ...options.headers }
        : options.headers,
    })
  } catch (error) {
    const duration = Math.round(performance.now() - startedAt)
    showResponse(method, path, 0, duration, {
      error: 'ไม่สามารถเชื่อมต่อ API ได้',
    })
    throw new Error('ไม่สามารถเชื่อมต่อ API ได้')
  }

  const duration = Math.round(performance.now() - startedAt)
  const rawBody = await response.text()
  let data = null

  if (rawBody) {
    try {
      data = JSON.parse(rawBody)
    } catch {
      data = rawBody
    }
  }

  showResponse(method, path, response.status, duration, data)

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data
        ? data.error
        : `API ตอบกลับด้วยสถานะ ${response.status}`
    throw new Error(String(message))
  }

  return data
}

function readStudentForm() {
  return {
    firstName: elements.firstName.value.trim(),
    lastName: elements.lastName.value.trim(),
    studentId: elements.studentId.value.trim(),
    dateOfBirth: elements.dateOfBirth.value,
    gender: elements.gender.value,
  }
}

function resetForm() {
  elements.studentForm.reset()
  elements.editingId.value = ''
  elements.formMode.textContent = 'CREATE'
  elements.formTitle.textContent = 'เพิ่มนักศึกษาใหม่'
  elements.submitButtonText.textContent = 'เพิ่มนักศึกษา'
  elements.cancelEditButton.classList.add('hidden')
}

function startEditing(student) {
  elements.editingId.value = String(student.id)
  elements.firstName.value = student.firstName
  elements.lastName.value = student.lastName
  elements.studentId.value = student.studentId
  elements.dateOfBirth.value = student.dateOfBirth
  elements.gender.value = student.gender
  elements.formMode.textContent = `UPDATE · ID ${student.id}`
  elements.formTitle.textContent = 'แก้ไขข้อมูลนักศึกษา'
  elements.submitButtonText.textContent = 'บันทึกการแก้ไข'
  elements.cancelEditButton.classList.remove('hidden')
  document.querySelector('.form-panel').scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
  elements.firstName.focus({ preventScroll: true })
}

function getInitials(student) {
  const first = student.firstName?.trim().charAt(0) || ''
  const last = student.lastName?.trim().charAt(0) || ''
  return `${first}${last}`.toUpperCase() || 'ST'
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateValue
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function showStudent(student) {
  selectedStudent = student
  elements.emptyState.classList.add('hidden')
  elements.studentCard.classList.remove('hidden')
  elements.studentAvatar.textContent = getInitials(student)
  elements.resultName.textContent = `${student.firstName} ${student.lastName}`
  elements.resultStudentId.textContent = student.studentId
  elements.resultId.textContent = `ID ${student.id}`
  elements.resultDateOfBirth.textContent = formatDate(student.dateOfBirth)
  elements.resultGender.textContent = genderLabels[student.gender] || student.gender
  elements.lookupId.value = String(student.id)
}

function clearStudent() {
  selectedStudent = null
  elements.studentCard.classList.add('hidden')
  elements.emptyState.classList.remove('hidden')
}

async function findStudentById(id) {
  const student = await requestApi(`${API_BASE}/${id}`)
  showStudent(student)
  return student
}

elements.studentForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!elements.studentForm.reportValidity()) return

  const editingId = elements.editingId.value
  const method = editingId ? 'PATCH' : 'POST'
  const path = editingId ? `${API_BASE}/${editingId}` : API_BASE

  setLoading(elements.submitButton, true)
  try {
    const student = await requestApi(path, {
      method,
      body: JSON.stringify(readStudentForm()),
    })
    showStudent(student)
    resetForm()
    showToast(editingId ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มนักศึกษาเรียบร้อยแล้ว')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    setLoading(elements.submitButton, false)
  }
})

elements.lookupForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!elements.lookupForm.reportValidity()) return

  setLoading(elements.lookupButton, true)
  try {
    await findStudentById(elements.lookupId.value)
    showToast('พบข้อมูลนักศึกษาแล้ว')
  } catch (error) {
    clearStudent()
    showToast(error.message, 'error')
  } finally {
    setLoading(elements.lookupButton, false)
  }
})

elements.editButton.addEventListener('click', () => {
  if (selectedStudent) startEditing(selectedStudent)
})

elements.deleteButton.addEventListener('click', async () => {
  if (!selectedStudent) return

  const confirmed = window.confirm(
    `ต้องการลบ ${selectedStudent.firstName} ${selectedStudent.lastName} ใช่หรือไม่?`,
  )
  if (!confirmed) return

  setLoading(elements.deleteButton, true)
  try {
    const deletedId = selectedStudent.id
    await requestApi(`${API_BASE}/${deletedId}`, { method: 'DELETE' })
    if (elements.editingId.value === String(deletedId)) resetForm()
    elements.lookupId.value = ''
    clearStudent()
    showToast('ลบข้อมูลเรียบร้อยแล้ว')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    setLoading(elements.deleteButton, false)
  }
})

elements.resetButton.addEventListener('click', resetForm)
elements.cancelEditButton.addEventListener('click', resetForm)
