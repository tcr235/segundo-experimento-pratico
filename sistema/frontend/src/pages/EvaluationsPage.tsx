import React, { useEffect, useState } from 'react'
import ApiClient from '../components/ApiClient'
import { Evaluation, Student, ClassEntity, GoalStatus } from '../types/models'

const STATUSES: GoalStatus[] = ['MANA','MPA','MA']

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<ClassEntity[]>([])
  const [form, setForm] = useState({ studentId: '', classId: '', goal: '', status: 'MANA' as GoalStatus })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const e = await ApiClient.get<Evaluation[]>('/evaluations')
    if (e.ok && e.data) setEvaluations(e.data)
    const s = await ApiClient.get<Student[]>('/students')
    if (s.ok && s.data) setStudents(s.data)
    const c = await ApiClient.get<ClassEntity[]>('/classes')
    if (c.ok && c.data) setClasses(c.data)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await ApiClient.post('/evaluations', { studentId: form.studentId, classId: form.classId, goal: form.goal, status: form.status })
    setForm({ studentId: '', classId: '', goal: '', status: 'MANA' })
    fetchAll()
  }

  // pivot: goals are columns, rows are students; show latest status per student+goal
  const goals = Array.from(new Set(evaluations.map(ev => ev.goalName)))
  const latest: Record<string, Record<string, Evaluation>> = {}
  evaluations.forEach(ev => {
    latest[ev.studentId] = latest[ev.studentId] || {}
    const prev = latest[ev.studentId][ev.goalName]
    if (!prev || new Date(ev.updatedAt) > new Date(prev.updatedAt)) {
      latest[ev.studentId][ev.goalName] = ev
    }
  })

  return (
    <div>
      <h2>Evaluations</h2>

      <div className="card">
        <form onSubmit={submit} className="form-row">
          <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
            <option value="">Select class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.topic}</option>)}
          </select>
          <input placeholder="Goal" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="btn btn-primary">Submit</button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              {goals.map(g => <th key={g}>{g}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.name}</td>
                {goals.map(g => (
                  <td key={g}>{latest[s.id] && latest[s.id][g] ? latest[s.id][g].status : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
