import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  const role: UserRole = (req as any).user.role;

  try {
    if (role !== UserRole.ADMIN) throw { status: 401, message: 'Unauthorized admin' };

    next();
  } catch (error) {
    next(error);
  }
}