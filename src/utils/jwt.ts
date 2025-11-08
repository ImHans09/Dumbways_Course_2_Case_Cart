import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { UserPayload } from "../models/userpayload-model.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signToken = (payload: UserPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
};