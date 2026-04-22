import React, { useEffect, useState } from "react";
import ApiClient from "../components/ApiClient";
import { Student } from "../types/models";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState({ name: "", cpf: "", email: "" });
  const [editing, setEditing] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const res = await ApiClient.get<Student[]>("/students");
    if (res.ok && res.data) setStudents(res.data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await ApiClient.put<Student>(`/students/${editing.id}`, form);
      setEditing(null);
    } else {
      await ApiClient.post<Student>("/students", form);
    }
    setForm({ name: "", cpf: "", email: "" });
    fetchStudents();
  }

  async function startEdit(s: Student) {
    setEditing(s);
    setForm({ name: s.name, cpf: s.cpf, email: s.email });
  }

  async function remove(id: string) {
    if (!confirm("Delete student?")) return;
    await ApiClient.del(`/students/${id}`);
    fetchStudents();
  }

  return (
    <div>
      <h2>Students</h2>

      <div className="card">
        <form onSubmit={submit}>
          <div className="form-row">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="CPF"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <button type="submit" className="btn btn-primary">
              {editing ? "Save" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th className="small">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td className="muted small">{s.email}</td>
                <td>
                  <div className="flex">
                    <button className="btn" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => remove(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
