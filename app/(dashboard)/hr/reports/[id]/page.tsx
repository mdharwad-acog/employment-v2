"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Report {
  id: string;
  employeeId: string;
  reportType: string;
  reportDate: string;
  weekStartDate?: string;
  weekEndDate?: string;
  content: string;
  status: string;
  submittedAt?: string;
}

interface Employee {
  employee_id: string;
  name: string;
  department: string;
  email: string;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const reportsRes = await fetch("/api/reports");
        const reportsData = await reportsRes.json();
        const foundReport = reportsData.find((r: Report) => r.id === params.id);

        if (foundReport) {
          setReport(foundReport);

          const employeesRes = await fetch("/api/employees");
          const employeesData = await employeesRes.json();
          const foundEmployee = employeesData.find(
            (e: Employee) => e.employee_id === foundReport.employeeId
          );
          setEmployee(foundEmployee);
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Report not found</p>
          <Link href="/hr/reports">
            <Button className="mt-4" variant="outline">
              Back to Reports
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Report Details</h1>
          <p className="text-muted-foreground">Review submitted report</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Employee</span>
              </div>
              <p className="text-sm pl-6">{employee?.name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground pl-6">
                {employee?.department}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Report Type</span>
              </div>
              <p className="text-sm pl-6">{report.reportType}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Period</span>
              </div>
              <p className="text-sm pl-6">
                {report.weekStartDate && report.weekEndDate
                  ? `${format(
                      new Date(report.weekStartDate),
                      "MMM d"
                    )} - ${format(new Date(report.weekEndDate), "MMM d, yyyy")}`
                  : format(new Date(report.reportDate), "MMM d, yyyy")}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Status</span>
              </div>
              <div className="pl-6">
                <Badge
                  variant={
                    report.status === "Submitted" ? "default" : "secondary"
                  }
                >
                  {report.status}
                </Badge>
              </div>
            </div>

            {report.submittedAt && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground pl-0">
                    {format(new Date(report.submittedAt), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Content</CardTitle>
            <CardDescription>Employee submitted report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {report.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
