import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "reports.json");

export async function GET(request: NextRequest) {
  try {
    const data = readFileSync(DATA_PATH, "utf-8");
    const reports = JSON.parse(data);

    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const reportType = searchParams.get("reportType");
    const status = searchParams.get("status");

    let filtered = reports;

    if (employeeId) {
      filtered = filtered.filter((r: any) => r.employeeId === employeeId);
    }

    if (reportType) {
      filtered = filtered.filter((r: any) => r.reportType === reportType);
    }

    if (status) {
      filtered = filtered.filter((r: any) => r.status === status);
    }

    filtered.sort(
      (a: any, b: any) =>
        new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime()
    );

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error reading reports:", error);
    return NextResponse.json(
      { error: "Failed to read reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readFileSync(DATA_PATH, "utf-8");
    const reports = JSON.parse(data);

    const newId = `rpt_${String(reports.length + 1).padStart(3, "0")}`;

    const newReport = {
      id: newId,
      employeeId: body.employeeId,
      reportType: body.reportType,
      reportDate: body.reportDate,
      weekStartDate: body.weekStartDate,
      weekEndDate: body.weekEndDate,
      content: body.content,
      status: body.status || "Draft",
      submittedAt:
        body.status === "Submitted" ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.push(newReport);
    writeFileSync(DATA_PATH, JSON.stringify(reports, null, 2));

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
