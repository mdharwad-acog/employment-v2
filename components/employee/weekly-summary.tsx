"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { Clock, Calendar, TrendingUp } from "lucide-react";

interface WeeklySummary {
  totalHours: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    totalHours: number;
  }[];
  dailyLogs: any[];
}

interface WeeklySummaryProps {
  employeeId: string;
}

export function WeeklySummary({ employeeId }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const weekStart = format(
          startOfWeek(new Date(), { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );
        const weekEnd = format(
          endOfWeek(new Date(), { weekStartsOn: 1 }),
          "yyyy-MM-dd"
        );

        const response = await fetch(
          `/api/time-logs/summary?employeeId=${employeeId}&weekStart=${weekStart}&weekEnd=${weekEnd}`
        );

        if (!response.ok) throw new Error("Failed to fetch summary");

        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Failed to load weekly summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [employeeId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "MMM d"
  );
  const weekEnd = format(
    endOfWeek(new Date(), { weekStartsOn: 1 }),
    "MMM d, yyyy"
  );
  const targetHours = 40;
  const currentHours = summary?.totalHours || 0;
  const progress = (currentHours / targetHours) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          This Week&apos;s Summary
        </CardTitle>
        <CardDescription>
          {weekStart} - {weekEnd}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Hours</span>
          </div>
          <span className="text-2xl font-bold">{currentHours.toFixed(1)}h</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Progress to {targetHours}h
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={Math.min(progress, 100)} />
          {progress >= 100 && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>Weekly target achieved!</span>
            </div>
          )}
        </div>

        {summary && summary.projectBreakdown.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Project Breakdown</p>
            {summary.projectBreakdown.map((project) => (
              <div
                key={project.projectId}
                className="flex justify-between text-sm"
              >
                <span className="text-muted-foreground truncate">
                  {project.projectName}
                </span>
                <span className="font-medium ml-2">
                  {project.totalHours.toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        )}

        {(!summary || summary.totalHours === 0) && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No time logged this week yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start logging your daily hours to see your progress
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
