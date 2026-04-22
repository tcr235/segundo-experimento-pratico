import { EmailMessage } from "../models/notification";
import { Student, Evaluation } from "../models/types";

export default class EmailService {
  // Console adapter for development. Replace with SMTP adapter for production.
  static async send(message: EmailMessage) {
    // eslint-disable-next-line no-console
    console.log("--- Sending email ---");
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(message, null, 2));
  }

  static composeDailySummary(
    student: Student,
    evaluations: Evaluation[],
  ): EmailMessage {
    const lines: string[] = [];
    lines.push(`Hello ${student.name},`);
    lines.push("");
    lines.push("Here is a summary of your evaluation updates for today:");
    lines.push("");
    if (evaluations.length === 0) {
      lines.push("No updates today.");
    } else {
      for (const ev of evaluations) {
        lines.push(
          `- Class ${ev.classId}: ${ev.goalName} -> ${ev.status} (at ${ev.updatedAt})`,
        );
      }
    }
    lines.push("");
    lines.push("Regards,");
    lines.push("Academic System");

    return {
      to: student.email,
      subject: "Daily evaluation summary",
      body: lines.join("\n"),
    };
  }
}
