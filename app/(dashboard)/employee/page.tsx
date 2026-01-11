import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DailyTimeLog } from "@/components/employee/daily-time-log";
import { WeeklySummary } from "@/components/employee/weekly-summary";
import { Award, FileText } from "lucide-react";
import Link from "next/link";

export default async function EmployeeDashboard() {
  const session = await getSession();

  const employee = session.employee_id
    ? mockDB.getEmployeeById(session.employee_id)
    : null;

  const assignments = session.employee_id
    ? mockDB.getActiveAssignmentsByEmployeeId(session.employee_id)
    : [];

  const totalAllocation = assignments.reduce(
    (sum, a) => sum + a.allocation_percentage,
    0
  );

  // Transform assignments with project details for DailyTimeLog component
  const assignmentsWithProjects = assignments.map((assignment) => {
    const project = mockDB.getProjectById(assignment.project_id);
    return {
      projectId: assignment.project_id,
      projectName: project?.project_name || "Unknown Project",
      projectCode: project?.project_code || "N/A",
      role: assignment.role,
      allocation: assignment.allocation_percentage,
    };
  });

  const projectDetails = assignments.map((assignment) => {
    const project = mockDB.getProjectById(assignment.project_id);
    return { assignment, project };
  });

  if (!employee || !session.employee_id) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>
              Please log in to view your dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {employee.name}</h1>
          <p className="text-muted-foreground">
            {employee.department} • {employee.employee_type}
          </p>
        </div>
        <Link href="/employee/reports/new">
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </Link>
      </div>
      {/* Time Tracking Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <WeeklySummary employeeId={session.employee_id} />
        <DailyTimeLog
          employeeId={session.employee_id}
          assignments={assignmentsWithProjects}
        />
      </div>
      {/* Allocation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
            <CardDescription>Your capacity utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{totalAllocation}%</div>
            <Progress value={totalAllocation} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {totalAllocation === 100
                ? "Fully allocated"
                : `${100 - totalAllocation}% available`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Currently assigned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department</CardTitle>
            <CardDescription>Your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{employee.department}</div>
            <p className="text-sm text-muted-foreground">
              {employee.working_location}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Your current assignments and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectDetails.map(({ assignment, project }) => (
              <div
                key={assignment.assignment_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{project?.project_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {assignment.role}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {project?.project_code}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {assignment.allocation_percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground">Allocation</p>
                </div>
              </div>
            ))}
            {projectDetails.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No active projects assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/employee/reports/new">
            <Button className="w-full" variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Submit Weekly Report
            </Button>
          </Link>
          <Link href="/employee/skills">
            <Button className="w-full" variant="outline">
              <Award className="h-4 w-4 mr-2" />
              Manage Skills
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
