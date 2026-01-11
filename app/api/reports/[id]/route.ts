import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "reports.json");

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const data = readFileSync(DATA_PATH, "utf-8");
    let reports = JSON.parse(data);

    const index = reports.findIndex((r: any) => r.id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    reports[index] = {
      ...reports[index],
      content: body.content,
      status: body.status,
      submittedAt: body.submittedAt || reports[index].submittedAt,
    };

    writeFileSync(DATA_PATH, JSON.stringify(reports, null, 2));

    return NextResponse.json(reports[index]);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = readFileSync(DATA_PATH, "utf-8");
    let reports = JSON.parse(data);

    reports = reports.filter((r: any) => r.id !== params.id);

    writeFileSync(DATA_PATH, JSON.stringify(reports, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
