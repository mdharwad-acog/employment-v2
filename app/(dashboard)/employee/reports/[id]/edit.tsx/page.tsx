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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, isFriday } from "date-fns";
import { ArrowLeft, Send, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
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

export default function EditReportPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const today = new Date();
  const isFridayToday = isFriday(today);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch("/api/reports");
        const data = await response.json();
        const foundReport = data.find((r: Report) => r.id === params.id);

        if (foundReport && foundReport.status === "Draft") {
          setReport(foundReport);
          setContent(foundReport.content);
        }
      } catch (error) {
        console.error("Failed to fetch report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [params.id]);

  const handleUpdate = async (status: "Draft" | "Submitted") => {
    if (!content.trim()) {
      toast.error("Report content cannot be empty");
      return;
    }

    if (
      status === "Submitted" &&
      report?.reportType === "Weekly" &&
      !isFridayToday
    ) {
      toast.error("Weekly reports can only be submitted on Fridays");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status,
          submittedAt:
            status === "Submitted" ? new Date().toISOString() : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to update report");

      toast.success(
        status === "Draft"
          ? "Report saved as draft"
          : "Report submitted successfully!"
      );

      router.push("/employee/reports");
    } catch (error) {
      toast.error("Failed to update report");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

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
          <p className="text-muted-foreground">
            Report not found or already submitted
          </p>
          <Link href="/employee/reports">
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
        <Link href="/employee/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Report</h1>
          <p className="text-muted-foreground">
            Update your {report.reportType.toLowerCase()} report
          </p>
        </div>
      </div>

      {!isFridayToday && report.reportType === "Weekly" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Weekly reports must be submitted on Fridays. You can save as draft
            for now.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{report.reportType} Report</CardTitle>
          <CardDescription>
            {report.weekStartDate && report.weekEndDate
              ? `${format(new Date(report.weekStartDate), "MMM d")} - ${format(
                  new Date(report.weekEndDate),
                  "MMM d, yyyy"
                )}`
              : format(new Date(report.reportDate), "MMM d, yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="space-y-4">
              <div className="space-y-2">
                <Label>Report Content (Markdown supported)</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your report here using Markdown..."
                  className="min-h-[500px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use Markdown formatting: **bold**, *italic*, # Heading, - List
                  item
                </p>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No content to preview
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleUpdate("Draft")}
              disabled={isSaving}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleUpdate("Submitted")}
              disabled={
                isSaving || (!isFridayToday && report.reportType === "Weekly")
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {isSaving ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
