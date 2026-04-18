/**
 * Domain models and types for the backend.
 * Student IDs are UUID strings. CPF is stored but not exposed in URLs.
 */

export type UUID = string;

export type GoalStatus = "MANA" | "MPA" | "MA";

export interface Student {
  id: UUID;
  name: string;
  cpf: string; // stored, but must only be passed in request body for POST/PUT
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassEntity {
  id: UUID;
  topic: string;
  year: number;
  semester: number;
  students: UUID[]; // store student UUIDs
  createdAt: string;
  updatedAt?: string;
}

export interface Evaluation {
  id: UUID;
  studentId: UUID; // reference to Student.id
  classId: UUID; // reference to ClassEntity.id
  goalName: string;
  status: GoalStatus;
  updatedAt: string;
}
