import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import { canAccessFinancialData, canManageEmployees } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employees = mockDB.getEmployees();

  // Hide financial data for non-authorized roles
  if (!canAccessFinancialData(session.role)) {
    return NextResponse.json(
      employees.map((emp) => {
        const { base_cost_per_month, ...rest } = emp;
        return rest;
      })
    );
  }

  return NextResponse.json(employees);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !canManageEmployees(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const employee = mockDB.createEmployee({
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
