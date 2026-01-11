import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const LOGS_PATH = join(process.cwd(), "data", "daily-time-logs.json");
const PROJECTS_PATH = join(process.cwd(), "data", "projects.json");

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const weekStart = searchParams.get("weekStart");
    const weekEnd = searchParams.get("weekEnd");

    if (!employeeId || !weekStart || !weekEnd) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const logsData = readFileSync(LOGS_PATH, "utf-8");
    const projectsData = readFileSync(PROJECTS_PATH, "utf-8");

    const logs = JSON.parse(logsData);
    const projects = JSON.parse(projectsData);

    const weekLogs = logs.filter(
      (log: any) =>
        log.employeeId === employeeId &&
        log.logDate >= weekStart &&
        log.logDate <= weekEnd
    );

    const projectMap = new Map();

    weekLogs.forEach((log: any) => {
      log.projects.forEach((proj: any) => {
        if (!projectMap.has(proj.projectId)) {
          const project = projects.find(
            (p: any) => p.project_id === proj.projectId
          );
          projectMap.set(proj.projectId, {
            projectId: proj.projectId,
            projectName: project?.project_name || "Unknown Project",
            totalHours: 0,
            tasks: [],
          });
        }

        const entry = projectMap.get(proj.projectId);
        entry.totalHours += proj.hoursLogged;
        entry.tasks.push(proj.taskDescription);
      });
    });

    const summary = {
      employeeId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      totalHours: weekLogs.reduce(
        (sum: number, log: any) => sum + log.totalHours,
        0
      ),
      projectBreakdown: Array.from(projectMap.values()),
      dailyLogs: weekLogs,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Error generating summary:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
