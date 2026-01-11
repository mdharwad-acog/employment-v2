"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface Report {
  id: string;
  employeeId: string;
  reportType: string;
  reportDate: string;
  weekStartDate?: string;
  weekEndDate?: string;
  status: string;
  submittedAt?: string;
}

interface Employee {
  employee_id: string;
  name: string;
  department: string;
}

export default function HRReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsRes, employeesRes] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/employees"),
        ]);

        const reportsData = await reportsRes.json();
        const employeesData = await employeesRes.json();

        setReports(reportsData);
        setEmployees(employeesData);
        setFilteredReports(reportsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = reports;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (r) => r.status.toLowerCase() === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter((r) => {
        const employee = employees.find((e) => e.employee_id === r.employeeId);
        return employee?.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    setFilteredReports(filtered);
  }, [searchTerm, statusFilter, reports, employees]);

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((e) => e.employee_id === employeeId);
    return employee?.name || "Unknown";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      submitted: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      draft: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-amber-600",
      },
    };

    const config =
      statusConfig[status.toLowerCase() as keyof typeof statusConfig] ||
      statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const submittedCount = reports.filter((r) => r.status === "Submitted").length;
  const draftCount = reports.filter((r) => r.status === "Draft").length;
  const complianceRate =
    reports.length > 0
      ? ((submittedCount / reports.length) * 100).toFixed(1)
      : "0";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Weekly Reports</h1>
          <p className="text-muted-foreground">
            Review and manage employee reports
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCount}</div>
            <p className="text-xs text-muted-foreground">
              {draftCount} still in draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Compliance Rate
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Weekly submission rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>
            Filter and search through submitted reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {getEmployeeName(report.employeeId)}
                    </TableCell>
                    <TableCell>{report.reportType}</TableCell>
                    <TableCell>
                      {report.weekStartDate && report.weekEndDate
                        ? `${format(
                            new Date(report.weekStartDate),
                            "MMM d"
                          )} - ${format(
                            new Date(report.weekEndDate),
                            "MMM d, yyyy"
                          )}`
                        : format(new Date(report.reportDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {report.submittedAt
                        ? format(new Date(report.submittedAt), "MMM d, h:mm a")
                        : "Not submitted"}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/hr/reports/${report.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
