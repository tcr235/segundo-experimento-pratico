import React, { useEffect, useState } from 'react'
import ApiClient from '../components/ApiClient'
import { ClassEntity, Student } from '../types/models'

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ topic: '', year: 2026, semester: 1 })
  const [enroll, setEnroll] = useState({ classId: '', studentId: '' })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const c = await ApiClient.get<ClassEntity[]>('/classes')
    if (c.ok && c.data) setClasses(c.data)
    const s = await ApiClient.get<Student[]>('/students')
    if (s.ok && s.data) setStudents(s.data)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await ApiClient.post<ClassEntity>('/classes', form)
    setForm({ topic: '', year: 2026, semester: 1 })
    fetchAll()
  }

  async function doEnroll(e: React.FormEvent) {
    e.preventDefault()
    await ApiClient.post(`/classes/${enroll.classId}/enroll`, { studentId: enroll.studentId })
    setEnroll({ classId: '', studentId: '' })
    fetchAll()
  }

  return (
    <div>
      <h2>Classes</h2>
      <form onSubmit={submit} style={{ marginBottom: 16 }}>
        <input placeholder="Topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
        <input type="number" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} />
        <button type="submit">Create Class</button>
      </form>

      <h3>Enroll Student</h3>
      <form onSubmit={doEnroll} style={{ marginBottom: 16 }}>
        <select value={enroll.classId} onChange={(e) => setEnroll({ ...enroll, classId: e.target.value })}>
          <option value="">Select class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.topic} ({c.year}/{c.semester})</option>)}
        </select>
        <select value={enroll.studentId} onChange={(e) => setEnroll({ ...enroll, studentId: e.target.value })}>
          <option value="">Select student</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <button type="submit">Enroll</button>
      </form>

      <ul>
        {classes.map(c => (
          <li key={c.id}>{c.topic} — {c.year}/{c.semester} — students: {c.students.length}</li>
        ))}
      </ul>
    </div>
  )
}
