import React, { useEffect, useState } from 'react'
import ApiClient from '../components/ApiClient'
import { Student } from '../types/models'

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ name: '', cpf: '', email: '' })

  useEffect(() => { fetchStudents() }, [])

  async function fetchStudents() {
    const res = await ApiClient.get<Student[]>('/students')
    if (res.ok && res.data) setStudents(res.data)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await ApiClient.post<Student>('/students', form)
    setForm({ name: '', cpf: '', email: '' })
    fetchStudents()
  }

  return (
    <div>
      <h2>Students</h2>
      <form onSubmit={submit} style={{ marginBottom: 16 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button type="submit">Create</button>
      </form>

      <ul>
        {students.map(s => (
          <li key={s.id}>{s.name} — {s.email}</li>
        ))}
      </ul>
    </div>
  )
}
