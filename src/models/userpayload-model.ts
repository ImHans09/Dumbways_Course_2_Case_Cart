import { UserRole } from "@prisma/client";

export interface UserPayload {
  id: number,
  role: UserRole
}