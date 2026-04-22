import { Request, Response } from "express";
import NotificationRepository from "../repositories/notificationRepository";
import EmailService from "../services/emailService";
import JsonRepository from "../repositories/jsonRepository";
import { Student, Evaluation } from "../models/types";

const studentsRepo = new JsonRepository<Student[]>("src/data/students.json");
const evaluationsRepo = new JsonRepository<Evaluation[]>(
  "src/data/evaluations.json",
);

/**
 * Aggregate pending notifications by student, compose emails, send, and clear pending.
 */
export async function sendDailyNotifications(_req: Request, res: Response) {
  // load pending notifications
  const pending = await NotificationRepository.list();
  // group by studentId
  const byStudent: Record<string, string[]> = {};
  for (const p of pending) {
    byStudent[p.studentId] = byStudent[p.studentId] || [];
    byStudent[p.studentId].push(p.evaluationId);
  }

  const students = await studentsRepo.read();
  const evaluations = await evaluationsRepo.read();

  const results: Array<{ studentId: string; sent: boolean; error?: string }> =
    [];

  for (const studentId of Object.keys(byStudent)) {
    try {
      const student = (students || []).find((s) => s.id === studentId) as
        | Student
        | undefined;
      if (!student) {
        results.push({ studentId, sent: false, error: "student not found" });
        continue;
      }
      const evs = (evaluations || []).filter((e) =>
        byStudent[studentId].includes(e.id),
      );
      const message = EmailService.composeDailySummary(student, evs);
      await EmailService.send(message);
      await NotificationRepository.clearForStudent(studentId);
      results.push({ studentId, sent: true });
    } catch (err: any) {
      results.push({ studentId, sent: false, error: String(err) });
    }
  }

  return res.json({ results, count: results.length });
}

export default {} as any;
