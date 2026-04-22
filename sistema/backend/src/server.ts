import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

import studentsRouter from "./routes/students";
app.use("/students", studentsRouter);
import classesRouter from "./routes/classes";
app.use("/classes", classesRouter);
import evaluationsRouter from "./routes/evaluations";
app.use("/evaluations", evaluationsRouter);
import notificationsRouter from "./routes/notifications";
app.use("/notifications", notificationsRouter);

// schedule daily notification job at 23:59 server local time
import cron from "node-cron";
import { sendDailyNotifications } from "./controllers/notificationController";

const scheduleExpr = process.env.NOTIFY_DAILY_CRON || "59 23 * * *";
cron.schedule(scheduleExpr, async () => {
  // call the controller function (no req/res)
  try {
    // simulate Request/Response not needed; use internal function path if available
    // We call sendDailyNotifications with dummy objects; it only uses req for no purpose.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await sendDailyNotifications({} as any, { json: () => {} } as any);
    // eslint-disable-next-line no-console
    console.log("Daily notification job executed");
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Daily notification job failed", err);
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});

export default app;
