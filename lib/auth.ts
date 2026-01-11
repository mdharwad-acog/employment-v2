import { mockDB } from "./mock-db";
import type { SessionData, UserRole } from "@/types";

export async function validateCredentials(
  email: string,
  password: string
): Promise<SessionData | null> {
  const user = mockDB.getUserByEmail(email);

  if (!user || user.password !== password) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    employee_id: user.employee_id,
    isLoggedIn: true,
  };
}

export function canAccessFinancialData(role: UserRole): boolean {
  return role === "HR" || role === "Leadership";
}

export function canManageEmployees(role: UserRole): boolean {
  return role === "HR" || role === "Leadership";
}

export function canManageAssignments(role: UserRole): boolean {
  return ["HR", "PM", "Leadership"].includes(role);
}

export function canMarkCritical(role: UserRole): boolean {
  return ["HR", "PM", "Leadership"].includes(role);
}
