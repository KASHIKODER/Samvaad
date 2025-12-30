import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { 
  getMessages, 
  uploadFile, 
  deleteMessage,
  getMessageById,
  updateMessage,
  markAsRead
} from "../controllers/MessagesController.js";
import multer from "multer";

const messagesRoutes = Router();
const upload = multer({ dest: "uploads/files/" });

// SIMPLIFIED ROUTES - remove complex patterns temporarily
messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);
messagesRoutes.post("/mark-read", verifyToken, markAsRead);

// Simple delete route without nested path
messagesRoutes.post("/delete-message", verifyToken, deleteMessage);

// Simple get message route
messagesRoutes.post("/get-message", verifyToken, getMessageById);

// Simple update route
messagesRoutes.post("/update-message", verifyToken, updateMessage);

export default messagesRoutes;