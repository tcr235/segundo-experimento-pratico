import { Request, Response } from 'express';
import JsonRepository from '../repositories/jsonRepository';
import { ClassEntity } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const repo = new JsonRepository<ClassEntity[]>('src/data/classes.json');
import studentsRepo from '../repositories/jsonRepository';

async function ensureStudentExists(studentId: string) {
  const srepo = new JsonRepository<any[]>('src/data/students.json');
  const students = await srepo.read();
  return Array.isArray(students) && students.find((s) => (s as any).id === studentId);
}

export async function createClass(req: Request, res: Response) {
  const body = req.body;
  if (!body || typeof body.topic !== 'string' || typeof body.year !== 'number' || typeof body.semester !== 'number') {
    return res.status(400).json({ error: 'topic (string), year (number) and semester (number) are required' });
  }

  const cls: ClassEntity = {
    id: uuidv4(),
    topic: body.topic,
    year: body.year,
    semester: body.semester,
    students: Array.isArray(body.students) ? body.students : [],
    createdAt: new Date().toISOString(),
  };

  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    return [...list, cls] as unknown as ClassEntity[];
  });

  return res.status(201).json(cls);
}

export async function getAllClasses(_req: Request, res: Response) {
  const list = await repo.read();
  return res.json(list || []);
}

export async function enrollStudent(req: Request, res: Response) {
  const classId = req.params.id;
  const { studentId } = req.body;
  if (!studentId || typeof studentId !== 'string') return res.status(400).json({ error: 'studentId (UUID) required in body' });

  const studentExists = await ensureStudentExists(studentId);
  if (!studentExists) return res.status(404).json({ error: 'Student not found' });

  let enrolled = false;
  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    const idx = list.findIndex((c) => (c as ClassEntity).id === classId);
    if (idx === -1) return list as unknown as ClassEntity[]; // class not found
    const cls = { ...(list[idx] as ClassEntity) } as ClassEntity;
    if (!cls.students.includes(studentId)) {
      cls.students = [...cls.students, studentId];
      list[idx] = cls as unknown as ClassEntity;
      enrolled = true;
    }
    return list as unknown as ClassEntity[];
  });

  if (!enrolled) return res.status(404).json({ error: 'Class not found or student already enrolled' });
  return res.status(204).send();
}

export async function updateClass(req: Request, res: Response) {
  const id = req.params.id;
  const body = req.body;
  if (!body || typeof body.topic !== 'string' || typeof body.year !== 'number' || typeof body.semester !== 'number') {
    return res.status(400).json({ error: 'topic (string), year (number) and semester (number) are required' });
  }

  let updated: ClassEntity | null = null;
  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    const idx = list.findIndex((c) => (c as ClassEntity).id === id);
    if (idx === -1) return list as unknown as ClassEntity[];
    const existing = list[idx] as ClassEntity;
    const merged: ClassEntity = {
      ...existing,
      topic: body.topic,
      year: body.year,
      semester: body.semester,
      updatedAt: new Date().toISOString(),
    };
    const next = [...list];
    next[idx] = merged as unknown as ClassEntity;
    updated = merged;
    return next as unknown as ClassEntity[];
  });

  if (!updated) return res.status(404).json({ error: 'Class not found' });
  return res.json(updated);
}

export async function deleteClass(req: Request, res: Response) {
  const id = req.params.id;
  let removed = false;
  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    const next = list.filter((c) => (c as ClassEntity).id !== id) as unknown as ClassEntity[];
    removed = next.length !== list.length;
    return next;
  });

  if (!removed) return res.status(404).json({ error: 'Class not found' });
  return res.status(204).send();
}
