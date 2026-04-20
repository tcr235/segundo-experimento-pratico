import { Request, Response } from "express";
import JsonRepository from "../repositories/jsonRepository";
import { Student } from "../models/types";
import { v4 as uuidv4 } from "uuid";

const repo = new JsonRepository<Student[]>("src/data/students.json");

function validatePayload(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!body) {
    errors.push("Missing request body");
    return { valid: false, errors };
  }
  if (!body.name || typeof body.name !== "string")
    errors.push("name is required");
  if (!body.cpf || typeof body.cpf !== "string") errors.push("cpf is required");
  if (!body.email || typeof body.email !== "string")
    errors.push("email is required");
  return { valid: errors.length === 0, errors };
}

export async function createStudent(req: Request, res: Response) {
  const { valid, errors } = validatePayload(req.body);
  if (!valid) return res.status(400).json({ errors });

  const student: Student = {
    id: uuidv4(),
    name: req.body.name,
    cpf: req.body.cpf,
    email: req.body.email,
    createdAt: new Date().toISOString(),
  };

  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    return [...list, student] as unknown as Student[];
  });

  return res.status(201).json(student);
}

export async function getAllStudents(_req: Request, res: Response) {
  const list = await repo.read();
  return res.json(list || []);
}

export async function getStudentById(req: Request, res: Response) {
  const id = req.params.id;
  const list = await repo.read();
  const student = (list || []).find((s) => (s as Student).id === id) as
    | Student
    | undefined;
  if (!student) return res.status(404).json({ error: "Student not found" });
  return res.json(student);
}

export async function updateStudent(req: Request, res: Response) {
  const id = req.params.id;
  const { valid, errors } = validatePayload(req.body);
  if (!valid) return res.status(400).json({ errors });

  let updated: Student | null = null;
  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    const idx = list.findIndex((s) => (s as Student).id === id);
    if (idx === -1) return list as unknown as Student[]; // no change
    const existing = list[idx] as Student;
    const merged: Student = {
      ...existing,
      name: req.body.name,
      cpf: req.body.cpf,
      email: req.body.email,
      updatedAt: new Date().toISOString(),
    };
    const next = [...list];
    next[idx] = merged as unknown as Student;
    updated = merged as Student;
    return next as unknown as Student[];
  });

  if (!updated) return res.status(404).json({ error: "Student not found" });
  return res.json(updated);
}

export async function deleteStudent(req: Request, res: Response) {
  const id = req.params.id;
  let removed = false;
  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    const next = list.filter(
      (s) => (s as Student).id !== id,
    ) as unknown as Student[];
    removed = next.length !== list.length;
    return next;
  });

  if (!removed) return res.status(404).json({ error: "Student not found" });
  return res.status(204).send();
}
