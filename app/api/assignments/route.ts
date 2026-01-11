import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import { canManageAssignments } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employee_id");
  const projectId = searchParams.get("project_id");

  if (employeeId) {
    const assignments = mockDB.getAssignmentsByEmployeeId(employeeId);
    return NextResponse.json(assignments);
  }

  if (projectId) {
    const assignments = mockDB.getAssignmentsByProjectId(projectId);
    return NextResponse.json(assignments);
  }

  const assignments = mockDB.getAssignments();
  return NextResponse.json(assignments);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !canManageAssignments(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const result = mockDB.createAssignment({
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if ("error" in result) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
