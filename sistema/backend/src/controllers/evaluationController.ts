import { Request, Response } from 'express';
import JsonRepository from '../repositories/jsonRepository';
import { Evaluation } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

const repo = new JsonRepository<Evaluation[]>('src/data/evaluations.json');

const ALLOWED: string[] = ['MANA', 'MPA', 'MA'];

export async function createEvaluation(req: Request, res: Response) {
  const body = req.body;
  if (!body || typeof body.studentId !== 'string' || typeof body.classId !== 'string' || typeof body.goal !== 'string' || typeof body.status !== 'string') {
    return res.status(400).json({ error: 'studentId (UUID), classId (UUID), goal (string) and status (string) are required' });
  }
  if (!ALLOWED.includes(body.status)) {
    return res.status(400).json({ error: `status must be one of ${ALLOWED.join(', ')}` });
  }

  const evaluation: Evaluation = {
    id: uuidv4(),
    studentId: body.studentId,
    classId: body.classId,
    goalName: body.goal,
    status: body.status,
    updatedAt: new Date().toISOString(),
  };

  await repo.update((current) => {
    const list = Array.isArray(current) ? current : [];
    return [...list, evaluation] as unknown as Evaluation[];
  });

  return res.status(201).json(evaluation);
}

export async function getEvaluations(_req: Request, res: Response) {
  const list = await repo.read();
  return res.json(list || []);
}
