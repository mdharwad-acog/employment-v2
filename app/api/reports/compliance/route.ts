import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import type { Report } from "@/types";
import {
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  format,
  isFriday,
} from "date-fns";

const REPORTS_PATH = join(process.cwd(), "data", "reports.json");
const EMPLOYEES_PATH = join(process.cwd(), "data", "employees.json");

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing date range" },
        { status: 400 }
      );
    }

    const reportsData = readFileSync(REPORTS_PATH, "utf-8");
    const employeesData = readFileSync(EMPLOYEES_PATH, "utf-8");

    const reports: Report[] = JSON.parse(reportsData);
    const employees = JSON.parse(employeesData);

    // Get all weeks in the range
    const weeks = eachWeekOfInterval(
      { start: new Date(startDate), end: new Date(endDate) },
      { weekStartsOn: 1 } // Monday
    );

    const compliance: any[] = [];

    employees.forEach((emp: any) => {
      const employeeType = emp.employeeType;
      const expectedType = employeeType === "Intern" ? "Daily" : "Weekly";

      weeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const weekEndStr = format(weekEnd, "yyyy-MM-dd");

        const submitted = reports.find(
          (r) =>
            r.employeeId === emp.id &&
            r.reportType === expectedType &&
            r.status === "Submitted" &&
            r.weekEndDate === weekEndStr
        );

        compliance.push({
          employeeId: emp.id,
          employeeName: emp.name,
          weekStart: format(weekStart, "yyyy-MM-dd"),
          weekEnd: weekEndStr,
          expectedType,
          submitted: !!submitted,
          submittedAt: submitted?.submittedAt,
        });
      });
    });

    const totalExpected = compliance.length;
    const totalSubmitted = compliance.filter((c) => c.submitted).length;
    const complianceRate =
      totalExpected > 0 ? (totalSubmitted / totalExpected) * 100 : 0;

    return NextResponse.json({
      complianceRate: Math.round(complianceRate),
      totalExpected,
      totalSubmitted,
      details: compliance,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to calculate compliance" },
      { status: 500 }
    );
  }
}
