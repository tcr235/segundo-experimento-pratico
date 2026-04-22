import { Router } from "express";
import {
  createClass,
  getAllClasses,
  enrollStudent,
  updateClass,
  deleteClass,
  getClassById,
} from "../controllers/classController";

const router = Router();

router.post("/", createClass);
router.get("/", getAllClasses);
router.get("/:id", getClassById);
router.post("/:id/enroll", enrollStudent);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;
