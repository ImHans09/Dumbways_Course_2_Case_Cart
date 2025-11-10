import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export function authorizeSupplier(req: Request, res: Response, next: NextFunction) {
  const role: UserRole = (req as any).user.role;

  try {
    if (role !== UserRole.SUPPLIER) throw { status: 401, message: 'Unauthorized supplier' };

    next();
  } catch (error) {
    next(error);
  }
}