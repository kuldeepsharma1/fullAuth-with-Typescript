import { Request, Response, NextFunction } from "express";
import { User } from "../model/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import { generateJWTToken } from "../utils/generateJWTToken";
import { generateVerificationToken } from "../utils/generateVerificationToken";
 import {
   sendPasswordResetEmail,
   sendResetSuccessEmail,
   sendVerificationEmail,
   sendWelcomeEmail,
 } from "../resend/email";
import jwt from 'jsonwebtoken';

 interface DecodedToken {
  userId: string;
}

interface CustomRequest extends Request {
  userId?: string; // or whatever type userId should be
}
// Rate Limiting Setup
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 login attempts per IP
  message: { success: false, message: "Too many login attempts, please try again later" },
});

const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Max 3 signups per IP
  message: { success: false, message: "Too many signup attempts, please try again later" },
});

// Helper function: Check if a user exists by email or username
const checkUserExistence = async (email: string, username: string) => {
  const [userByEmail, userByUsername] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
  ]);
  return { userByEmail, userByUsername };
};

// Signup
export const signup = [
  signupLimiter,
  async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: "All fields are required" });
      return;
    }

    try {
      const { userByEmail, userByUsername } = await checkUserExistence(email, username);

      if (userByUsername) {
        res.status(400).json({ success: false, message: "Username already taken" });
        return;
      }
      if (userByEmail) {
        res.status(400).json({ success: false, message: "Email already exists" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = generateVerificationToken();

      const user = new User({
        username,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      });

      await user.save();
      generateJWTToken(res, user._id.toString());
      console.log(verificationToken);
      
       await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({
        success: true,
        message: "User created successfully. Please verify your email.",
        user: { username: user.username, email: user.email },
      });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  },
];

// Login
export const login = [
  loginLimiter,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: "All fields are required" });
      return;
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ success: false, message: "Invalid credentials" });
        return;
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ success: false, message: "Invalid Password." });
        return;
      }
      if (!user.isVerified) {
        res.status(400).json({ success: false, message: "Email not verified" });
        return;
      }

      generateJWTToken(res, user._id.toString());

      res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
  },
];

// Logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired verification code" });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.username);
    res.status(200).json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours


    await user.save();
     await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`);

    res.status(200).json({ success: true, message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ success: false, message: "Password is required" });
    return;
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

     await sendResetSuccessEmail(user.email);
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Check Authentication
export const checkAuth = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return; // Ensure no further execution after response
    }

    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return; // Ensure no further execution after response
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Route to refresh the access token
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "Refresh token missing" });
    return; // Ensure void is returned here
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as DecodedToken;
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_ACCESS_SECRET!, {
      expiresIn: "1h",
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ success: true, accessToken: newAccessToken });
    return; // Ensure void is returned here
  } catch (err) {
    res.status(403).json({ success: false, message: "Invalid refresh token" });
    return; // Ensure void is returned here
  }
};
