import jwt from 'jsonwebtoken';
import { Response } from 'express';

interface JWTTokenResult {
  accessToken: string;
  refreshToken: string;
}

export const generateJWTToken = (res: Response, userId: string): JWTTokenResult => {
  // Access Token - expires in 1 hour
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: '1h', // short-lived token
  });

  // Refresh Token - expires in 7 days
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d', // long-lived token
  });

  // Store Access Token in an HTTP-only cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use HTTPS in production
    sameSite: 'strict',
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  // Store Refresh Token in an HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // use HTTPS in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Return the Access Token and Refresh Token
  return { accessToken, refreshToken };
};
