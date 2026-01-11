import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function PMDashboard() {
  const session = await getSession();
  const projects = mockDB.getProjects().filter((p) => p.status === "Active");

  const projectsWithDetails = projects.map((project) => {
    const assignments = mockDB.getAssignmentsByProjectId(project.project_id);
    const teamCount = assignments.filter((a) => a.status === "Active").length;
    const monthlyCost = mockDB.calculateProjectMonthlyCost(project.project_id);
    const criticalCount = assignments.filter(
      (a) => a.is_critical_resource && a.status === "Active"
    ).length;

    return {
      ...project,
      teamCount,
      monthlyCost,
      criticalCount,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PM Dashboard</h1>
          <p className="text-slate-600">
            Manage your projects and team resources
          </p>
        </div>
        <Link href="/pm/allocate">
          <Button>Allocate Resource</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Currently managing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Total allocated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {projectsWithDetails.reduce((sum, p) => sum + p.teamCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost</CardTitle>
            <CardDescription>All projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(
                projectsWithDetails.reduce((sum, p) => sum + p.monthlyCost, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Resources</CardTitle>
            <CardDescription>High bus factor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {projectsWithDetails.reduce((sum, p) => sum + p.criticalCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Active project portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectsWithDetails.map((project) => (
              <div
                key={project.project_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        project.project_code === "C" ? "default" : "secondary"
                      }
                    >
                      {project.project_code}
                    </Badge>
                    <h3 className="font-semibold">{project.project_name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {project.client_name && `${project.client_name} • `}
                    {project.teamCount} team members
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-lg font-bold">
                    {formatCurrency(project.monthlyCost)}
                  </div>
                  <p className="text-xs text-slate-600">per month</p>
                  {project.criticalCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {project.criticalCount} critical
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
