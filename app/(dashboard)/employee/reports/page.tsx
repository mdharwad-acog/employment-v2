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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

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

export default function EmployeeReportsHistoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const employeeId = "EMP001"; // In production, get from session

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`/api/reports?employeeId=${employeeId}`);
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDelete = async (reportId: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setReports(reports.filter((r) => r.id !== reportId));
      toast.success("Report deleted successfully");
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const submittedReports = reports.filter((r) => r.status === "Submitted");
  const draftReports = reports.filter((r) => r.status === "Draft");

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Reports</h1>
          <p className="text-muted-foreground">
            View and manage your submitted reports
          </p>
        </div>
        <Link href="/employee/reports/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submittedReports.length} Submitted
            </div>
            <p className="text-xs text-muted-foreground">
              {draftReports.length} drafts remaining
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>All your past and draft reports</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No reports yet</p>
              <Link href="/employee/reports/new">
                <Button>Create Your First Report</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {report.reportType}
                    </TableCell>
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
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "Submitted"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/employee/reports/${report.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {report.status === "Draft" && (
                          <>
                            <Link href={`/employee/reports/${report.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
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
