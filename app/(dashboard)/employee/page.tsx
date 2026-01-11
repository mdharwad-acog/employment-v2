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

  const projectDetails = assignments.map((assignment) => {
    const project = mockDB.getProjectById(assignment.project_id);
    return { assignment, project };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {employee?.name}
        </h1>
        <p className="text-slate-600">
          {employee?.department} • {employee?.employee_type}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Allocation</CardTitle>
            <CardDescription>Your capacity utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{totalAllocation}%</div>
            <Progress value={totalAllocation} className="h-2" />
            <p className="text-sm text-slate-600 mt-2">
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
            <div className="text-xl font-semibold">{employee?.department}</div>
            <p className="text-sm text-slate-600">
              {employee?.working_location}
            </p>
          </CardContent>
        </Card>
      </div>

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
                  <p className="text-sm text-slate-600">{assignment.role}</p>
                  <Badge variant="outline" className="mt-1">
                    {project?.project_code}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {assignment.allocation_percentage}%
                  </div>
                  <p className="text-xs text-slate-600">Allocation</p>
                </div>
              </div>
            ))}
            {projectDetails.length === 0 && (
              <p className="text-slate-600 text-center py-8">
                No active projects assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
