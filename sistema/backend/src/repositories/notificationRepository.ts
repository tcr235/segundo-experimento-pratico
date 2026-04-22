import JsonRepository from "./jsonRepository";
import { PendingNotification } from "../models/notification";

const repo = new JsonRepository<PendingNotification[]>(
  "src/data/pendingNotifications.json",
);

export default class NotificationRepository {
  static async add(notification: PendingNotification) {
    await repo.update((current) => {
      const list = Array.isArray(current) ? current : [];
      return [...list, notification];
    });
  }

  static async list(): Promise<PendingNotification[]> {
    const list = await repo.read();
    return Array.isArray(list) ? list : [];
  }

  static async clearForStudent(studentId: string) {
    await repo.update((current) => {
      const list = Array.isArray(current) ? current : [];
      return list.filter((n) => n.studentId !== studentId);
    });
  }

  static async clearAll() {
    await repo.write([] as PendingNotification[]);
  }
}
