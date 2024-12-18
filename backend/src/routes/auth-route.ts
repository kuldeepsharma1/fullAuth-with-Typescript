import express, { Request, Response, NextFunction } from "express";
import { login, logout, signup, verifyEmail, forgotPassword, resetPassword, checkAuth, refreshAccessToken } from "../controllers/auth-controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Auth Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Authenticated Check
router.get('/check-auth', verifyToken, checkAuth);
router.get('/refresh-token', refreshAccessToken);

// Centralized Error Handling
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default router;
