import React, { useEffect, useState } from "react";
import ApiClient from "../components/ApiClient";
import { ClassEntity, Student } from "../types/models";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassEntity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ topic: "", year: 2026, semester: 1 });
  const [enroll, setEnroll] = useState({ classId: "", studentId: "" });
  const [editing, setEditing] = useState<ClassEntity | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const c = await ApiClient.get<ClassEntity[]>("/classes");
    if (c.ok && c.data) setClasses(c.data);
    const s = await ApiClient.get<Student[]>("/students");
    if (s.ok && s.data) setStudents(s.data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await ApiClient.put(`/classes/${editing.id}`, form);
      setEditing(null);
    } else {
      await ApiClient.post<ClassEntity>("/classes", form);
    }
    setForm({ topic: "", year: 2026, semester: 1 });
    fetchAll();
  }

  async function startEdit(c: ClassEntity) {
    setEditing(c);
    setForm({ topic: c.topic, year: c.year, semester: c.semester });
  }

  async function remove(id: string) {
    if (!confirm("Delete class?")) return;
    await ApiClient.del(`/classes/${id}`);
    fetchAll();
  }

  async function doEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll.classId || !enroll.studentId)
      return alert("Select class and student");
    await ApiClient.post(`/classes/${enroll.classId}/enroll`, {
      studentId: enroll.studentId,
    });
    setEnroll({ classId: "", studentId: "" });
    fetchAll();
  }

  function getStudentName(id: string) {
    return students.find((s) => s.id === id)?.name || id;
  }

  return (
    <div>
      <h2>Classes</h2>

      <div className="card">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              placeholder="Topic"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
            <input
              type="number"
              placeholder="Year"
              value={form.year}
              onChange={(e) =>
                setForm({ ...form, year: Number(e.target.value) })
              }
            />
            <input
              type="number"
              placeholder="Semester"
              value={form.semester}
              onChange={(e) =>
                setForm({ ...form, semester: Number(e.target.value) })
              }
            />
            <button type="submit" className="btn btn-primary">
              {editing ? "Save" : "Create Class"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Enroll Student</h3>
        <form onSubmit={doEnroll} className="form-row">
          <select
            value={enroll.classId}
            onChange={(e) => setEnroll({ ...enroll, classId: e.target.value })}
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.topic} ({c.year}/{c.semester})
              </option>
            ))}
          </select>
          <select
            value={enroll.studentId}
            onChange={(e) =>
              setEnroll({ ...enroll, studentId: e.target.value })
            }
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-success">
            Enroll
          </button>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Topic</th>
              <th>Term</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td>{c.topic}</td>
                <td className="muted">
                  {c.year}/{c.semester}
                </td>
                <td>
                  {c.students.map((id) => (
                    <span key={id} className="chip">
                      {getStudentName(id)}
                    </span>
                  ))}
                </td>
                <td className="flex">
                  <button className="btn" onClick={() => startEdit(c)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => remove(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
