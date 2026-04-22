import { UUID } from "./types";

export interface PendingNotification {
  id: string;
  studentId: UUID;
  evaluationId: string;
  createdAt: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export default {} as any;
