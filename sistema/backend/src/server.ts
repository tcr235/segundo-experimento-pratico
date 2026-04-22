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
// Use a runtime require to avoid TS type resolution issues during test runs.
let cron: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cron = require("node-cron");
} catch (err) {
  cron = null;
}
import { sendDailyNotifications } from "./controllers/notificationController";

const scheduleExpr = process.env.NOTIFY_DAILY_CRON || "59 23 * * *";
if (cron && typeof cron.schedule === "function") {
  cron.schedule(scheduleExpr, async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await sendDailyNotifications({} as any, { json: () => {} } as any);
      // eslint-disable-next-line no-console
      console.log("Daily notification job executed");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Daily notification job failed", err);
    }
  });
}

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
