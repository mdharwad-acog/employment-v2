import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "daily-time-logs.json");

export async function GET(request: NextRequest) {
  try {
    const data = readFileSync(DATA_PATH, "utf-8");
    const logs = JSON.parse(data);

    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let filtered = logs;

    if (employeeId) {
      filtered = filtered.filter((log: any) => log.employeeId === employeeId);
    }

    if (startDate) {
      filtered = filtered.filter((log: any) => log.logDate >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter((log: any) => log.logDate <= endDate);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error reading time logs:", error);
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readFileSync(DATA_PATH, "utf-8");
    const logs = JSON.parse(data);

    const newId = `dtl_${String(logs.length + 1).padStart(3, "0")}`;

    const newLog = {
      id: newId,
      employeeId: body.employeeId,
      logDate: body.logDate,
      dayOfWeek: body.dayOfWeek,
      projects: body.projects,
      totalHours: body.projects.reduce(
        (sum: number, p: any) => sum + p.hoursLogged,
        0
      ),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logs.push(newLog);
    writeFileSync(DATA_PATH, JSON.stringify(logs, null, 2));

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error("Error creating time log:", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}
