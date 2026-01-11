import { mockDB } from "@/lib/mock-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate, formatCurrency, getAllocationBand } from "@/lib/utils";

export default async function EmployeesListPage() {
  const employees = mockDB.getEmployees();
  const activeEmployees = employees.filter((e) => e.status === "Active");

  const employeesWithAllocation = activeEmployees.map((emp) => {
    const allocation = emp.is_billable_resource
      ? mockDB.calculateEmployeeAllocation(emp.employee_id)
      : 0;
    const band = getAllocationBand(allocation);
    return { ...emp, allocation, band };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600">Manage company workforce</p>
        </div>
        <Link href="/hr/employees/new">
          <Button>Add New Employee</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Employees ({activeEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employeesWithAllocation.map((emp) => (
              <div
                key={emp.employee_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{emp.name}</h3>
                    <Badge variant="outline">{emp.employee_id}</Badge>
                    <Badge
                      variant={
                        emp.employee_type === "Full-Time"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {emp.employee_type}
                    </Badge>
                    {emp.is_billable_resource && (
                      <Badge variant="outline" className="bg-green-50">
                        Billable
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>{emp.email}</span>
                    <span>•</span>
                    <span>{emp.department}</span>
                    <span>•</span>
                    <span>{emp.working_location}</span>
                    <span>•</span>
                    <span>Joined {formatDate(emp.joining_date)}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {emp.is_billable_resource && (
                    <>
                      <div className="text-2xl font-bold">
                        {emp.allocation}%
                      </div>
                      <p className={`text-sm ${emp.band.color}`}>
                        {emp.band.label}
                      </p>
                    </>
                  )}
                  <div className="text-sm text-slate-600">
                    {formatCurrency(emp.base_cost_per_month)}/mo
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
