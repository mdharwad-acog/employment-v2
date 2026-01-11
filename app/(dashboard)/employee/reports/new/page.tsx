"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, isFriday } from "date-fns";
import { FileText, Send, ArrowLeft, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function NewReportPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState<string>("");
  const [reportType, setReportType] = useState<"Weekly" | "Daily">("Weekly");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const today = new Date();
  const isFridayToday = isFriday(today);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const session = await response.json();
          setEmployeeId(session.employee_id || "EMP001");
        } else {
          setEmployeeId("EMP001");
        }
      } catch {
        setEmployeeId("EMP001");
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    if (!employeeId) return;

    const fetchSummary = async () => {
      try {
        const weekStart = format(
          startOfWeek(today, { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );
        const weekEnd = format(
          endOfWeek(today, { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );

        const response = await fetch(
          `/api/time-logs/summary?employeeId=${employeeId}&weekStart=${weekStart}&weekEnd=${weekEnd}`
        );

        if (response.ok) {
          const data = await response.json();
          setSummary(data);
          generateTemplate(data);
        }
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      }
    };

    fetchSummary();
  }, [employeeId]);

  const generateTemplate = (summaryData: any) => {
    if (!summaryData) return;

    let template = `# Weekly Report\n\n`;
    template += `**Week:** ${format(
      new Date(summaryData.weekStartDate),
      "MMM d"
    )} - ${format(new Date(summaryData.weekEndDate), "MMM d, yyyy")}\n\n`;
    template += `**Total Hours:** ${summaryData.totalHours.toFixed(
      1
    )} hours\n\n`;

    if (summaryData.projectBreakdown.length > 0) {
      template += `## Time Breakdown\n\n`;
      summaryData.projectBreakdown.forEach((project: any) => {
        template += `### ${project.projectName}\n`;
        template += `- **Hours:** ${project.totalHours.toFixed(1)}\n`;
        template += `- **Tasks:**\n`;
        project.tasks.forEach((task: string) => {
          template += `  - ${task}\n`;
        });
        template += `\n`;
      });
    }

    template += `## Accomplishments\n\n`;
    template += `- \n- \n- \n\n`;

    template += `## Challenges\n\n`;
    template += `- \n\n`;

    template += `## Next Week's Goals\n\n`;
    template += `- \n- \n- \n`;

    setContent(template);
  };

  const handleSubmit = async (status: "Draft" | "Submitted") => {
    if (!content.trim()) {
      toast.error("Report content cannot be empty");
      return;
    }

    if (status === "Submitted" && reportType === "Weekly" && !isFridayToday) {
      toast.error("Weekly reports can only be submitted on Fridays");
      return;
    }

    setIsLoading(true);

    try {
      const weekStart = format(
        startOfWeek(today, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      const weekEnd = format(
        endOfWeek(today, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          reportType,
          reportDate: format(today, "yyyy-MM-dd"),
          weekStartDate: reportType === "Weekly" ? weekStart : undefined,
          weekEndDate: reportType === "Weekly" ? weekEnd : undefined,
          content,
          status,
        }),
      });

      if (!response.ok) throw new Error("Failed to save report");

      toast.success(
        status === "Draft"
          ? "Report saved as draft"
          : "Report submitted successfully!"
      );

      router.push("/employee");
    } catch (error) {
      toast.error("Failed to save report");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employee">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Submit Report</h1>
          <p className="text-muted-foreground">
            Write and submit your {reportType.toLowerCase()} report
          </p>
        </div>
      </div>

      {!isFridayToday && reportType === "Weekly" && (
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
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {reportType} Report
              </CardTitle>
              <CardDescription>
                {summary &&
                  `${summary.totalHours.toFixed(1)} hours logged this week`}
              </CardDescription>
            </div>
            <Select
              value={reportType}
              onValueChange={(v: any) => setReportType(v)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              onClick={() => handleSubmit("Draft")}
              disabled={isLoading}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("Submitted")}
              disabled={
                isLoading || (!isFridayToday && reportType === "Weekly")
              }
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
