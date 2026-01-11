import { mockDB } from "@/lib/mock-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Award, FileText, Search } from "lucide-react";

export default async function HRDashboard() {
  const employees = mockDB.getEmployees();
  const projects = mockDB.getProjects();

  const activeEmployees = employees.filter((e) => e.status === "Active");
  const billableEmployees = activeEmployees.filter(
    (e) => e.is_billable_resource
  );
  const activeProjects = projects.filter((p) => p.status === "Active");

  const totalProjectCost = activeProjects.reduce((sum, project) => {
    return sum + mockDB.calculateProjectMonthlyCost(project.project_id);
  }, 0);

  const allocationDistribution = {
    full: 0,
    high: 0,
    medium: 0,
    low: 0,
    bench: 0,
  };

  billableEmployees.forEach((emp) => {
    const allocation = mockDB.calculateEmployeeAllocation(emp.employee_id);
    if (allocation === 100) allocationDistribution.full++;
    else if (allocation >= 75) allocationDistribution.high++;
    else if (allocation >= 50) allocationDistribution.medium++;
    else if (allocation >= 25) allocationDistribution.low++;
    else allocationDistribution.bench++;
  });

  const benchRisk =
    billableEmployees.length > 0
      ? (allocationDistribution.bench / billableEmployees.length) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">HR Dashboard</h1>
        <p className="text-slate-600">
          Resource allocation overview and metrics
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Active headcount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeEmployees.length}</div>
            <p className="text-sm text-slate-600">
              {billableEmployees.length} billable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost</CardTitle>
            <CardDescription>All active projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalProjectCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bench Risk</CardTitle>
            <CardDescription>&lt;25% allocation</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                benchRisk < 10
                  ? "text-green-600"
                  : benchRisk < 20
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {benchRisk.toFixed(1)}%
            </div>
            <p className="text-sm text-slate-600">
              {benchRisk < 10
                ? "Healthy"
                : benchRisk < 20
                ? "Normal"
                : "Warning"}
            </p>
          </CardContent>
        </Card>
      </div>
      // Add navigation cards
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/hr/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reports Dashboard
              </CardTitle>
              <CardDescription>View all employee reports</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hr/skills">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Skills Catalog
              </CardTitle>
              <CardDescription>Manage organization skills</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/hr/search">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Resource Search
              </CardTitle>
              <CardDescription>Find employees by skills</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Allocation Distribution</CardTitle>
          <CardDescription>Billable resource capacity bands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(allocationDistribution).map(([band, count]) => (
              <div key={band} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {band} (
                  {band === "full"
                    ? "100%"
                    : band === "high"
                    ? "75-99%"
                    : band === "medium"
                    ? "50-74%"
                    : band === "low"
                    ? "25-49%"
                    : "<25%"}
                  )
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          billableEmployees.length > 0
                            ? (count / billableEmployees.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
