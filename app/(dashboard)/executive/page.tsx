import { mockDB } from "@/lib/mock-db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AllocationDonut } from "@/components/charts/allocation-donut";
import { ProjectBarChart } from "@/components/charts/project-bar-chart";
import { BillableHoursChart } from "@/components/charts/billable-hours-chart";
import { formatCurrency } from "@/lib/utils";

export default async function ExecutiveDashboard() {
  const employees = mockDB.getEmployees().filter((e) => e.status === "Active");
  const billableEmployees = employees.filter((e) => e.is_billable_resource);
  const projects = mockDB.getProjects();
  const activeProjects = projects.filter((p) => p.status === "Active");

  const allocationData = {
    full: 0,
    high: 0,
    medium: 0,
    low: 0,
    bench: 0,
  };

  billableEmployees.forEach((emp) => {
    const allocation = mockDB.calculateEmployeeAllocation(emp.employee_id);
    if (allocation === 100) allocationData.full++;
    else if (allocation >= 75) allocationData.high++;
    else if (allocation >= 50) allocationData.medium++;
    else if (allocation >= 25) allocationData.low++;
    else allocationData.bench++;
  });

  const allocationChartData = [
    { name: "Fully Allocated (100%)", value: allocationData.full },
    { name: "High (75-99%)", value: allocationData.high },
    { name: "Medium (50-74%)", value: allocationData.medium },
    { name: "Low (25-49%)", value: allocationData.low },
    { name: "Bench (<25%)", value: allocationData.bench },
  ];

  const projectStatusData = [
    {
      name: "Active",
      active: projects.filter((p) => p.status === "Active").length,
      completed: 0,
    },
    {
      name: "Planning",
      active: projects.filter((p) => p.status === "Planning").length,
      completed: 0,
    },
    {
      name: "Completed",
      active: 0,
      completed: projects.filter((p) => p.status === "Completed").length,
    },
  ];

  const billableHoursData = [
    { month: "Aug", billable: 1200, internal: 800 },
    { month: "Sep", billable: 1400, internal: 900 },
    { month: "Oct", billable: 1600, internal: 850 },
    { month: "Nov", billable: 1800, internal: 950 },
    { month: "Dec", billable: 1500, internal: 1000 },
    { month: "Jan", billable: 1900, internal: 900 },
  ];

  const topProjects = activeProjects
    .map((p) => ({
      ...p,
      cost: mockDB.calculateProjectMonthlyCost(p.project_id),
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  const totalMonthlyCost = topProjects.reduce((sum, p) => sum + p.cost, 0);
  const benchRisk =
    billableEmployees.length > 0
      ? (allocationData.bench / billableEmployees.length) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Executive Dashboard
        </h1>
        <p className="text-slate-600">
          Company-wide resource allocation metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Active workforce</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
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
            <p className="text-sm text-slate-600">
              {projects.filter((p) => p.project_code === "C").length} client
              projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Burn Rate</CardTitle>
            <CardDescription>Top 5 projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(totalMonthlyCost)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bench Risk</CardTitle>
            <CardDescription>Underutilization</CardDescription>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation Distribution</CardTitle>
            <CardDescription>Billable employees capacity bands</CardDescription>
          </CardHeader>
          <CardContent>
            <AllocationDonut data={allocationChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Portfolio Status</CardTitle>
            <CardDescription>Projects by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectBarChart data={projectStatusData} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Billable Hours Trend</CardTitle>
          <CardDescription>
            Last 6 months - Client vs Internal work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BillableHoursChart data={billableHoursData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Projects by Monthly Cost</CardTitle>
          <CardDescription>Highest resource investment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProjects.map((project, index) => (
              <div
                key={project.project_id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-400">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.project_name}</h3>
                    <p className="text-sm text-slate-600">
                      {project.project_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">
                    {formatCurrency(project.cost)}
                  </div>
                  <p className="text-xs text-slate-600">per month</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
