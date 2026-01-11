import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import { canAccessFinancialData } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = mockDB.getProjects();

  // Hide financial data for non-authorized roles
  if (!canAccessFinancialData(session.role)) {
    return NextResponse.json(
      projects.map((proj) => {
        const { budget_cap, ...rest } = proj;
        return rest;
      })
    );
  }

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const project = mockDB.createProject({
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
