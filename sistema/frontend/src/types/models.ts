export type UUID = string;

export type GoalStatus = "MANA" | "MPA" | "MA";

export interface Student {
  id: UUID;
  name: string;
  cpf: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassEntity {
  id: UUID;
  topic: string;
  year: number;
  semester: number;
  students: UUID[];
  createdAt: string;
  updatedAt?: string;
}

export interface Evaluation {
  id: UUID;
  studentId: UUID;
  classId: UUID;
  goalName: string;
  status: GoalStatus;
  updatedAt: string;
}
