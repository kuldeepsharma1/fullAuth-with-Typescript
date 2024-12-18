import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


interface DecodedToken {
  userId: string;
}
interface CustomRequest extends Request {
  userId?: string; // or whatever type userId should be
}

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction): void => {
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    res.status(401).json({ success: false, message: "Access token missing" });
    return;
  }

  try {

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!) as DecodedToken;
    req.userId = decoded.userId;
    next();
  } catch (err) {

    res.status(401).json({ success: false, message: "Invalid or expired access token" });
  }
};
