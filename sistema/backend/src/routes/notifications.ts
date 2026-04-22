import { Router } from "express";
import { sendDailyNotifications } from "../controllers/notificationController";

const router = Router();

// Manual trigger to run daily aggregation and send emails
router.post("/send-daily", sendDailyNotifications);

export default router;
