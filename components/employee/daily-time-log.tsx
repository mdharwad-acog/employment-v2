"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format, startOfWeek, addDays, isFriday, getDay } from "date-fns";

interface ProjectAssignment {
  projectId: string;
  projectName: string;
  projectCode: string;
  role: string;
  allocation: number;
}

interface TimeEntry {
  projectId: string;
  hoursLogged: number;
  taskDescription: string;
}

interface DailyTimeLogProps {
  employeeId: string;
  assignments: ProjectAssignment[];
}

export function DailyTimeLog({ employeeId, assignments }: DailyTimeLogProps) {
  const today = new Date();
  const dayOfWeek = getDay(today); // 0=Sunday, 1=Monday, ..., 5=Friday

  // Allow logging only Mon-Thu (1-4)
  const canLog = dayOfWeek >= 1 && dayOfWeek <= 4;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday"];
  const currentDayName = format(today, "EEEE");

  const [selectedDay, setSelectedDay] = useState<string>(
    canLog && daysOfWeek.includes(currentDayName) ? currentDayName : "Monday"
  );

  const [entries, setEntries] = useState<TimeEntry[]>([
    { projectId: "", hoursLogged: 0, taskDescription: "" },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const addEntry = () => {
    setEntries([
      ...entries,
      { projectId: "", hoursLogged: 0, taskDescription: "" },
    ]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof TimeEntry, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
  };

  const totalHours = entries.reduce(
    (sum, e) => sum + (parseFloat(String(e.hoursLogged)) || 0),
    0
  );

  const handleSubmit = async () => {
    if (!selectedDay) {
      toast.error("Please select a day");
      return;
    }

    const validEntries = entries.filter(
      (e) => e.projectId && e.hoursLogged > 0 && e.taskDescription.trim()
    );

    if (validEntries.length === 0) {
      toast.error("Please add at least one valid time entry");
      return;
    }

    if (totalHours > 24) {
      toast.error("Total hours cannot exceed 24");
      return;
    }

    if (totalHours === 0) {
      toast.error("Total hours must be greater than 0");
      return;
    }

    setIsLoading(true);

    try {
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const dayIndex = daysOfWeek.indexOf(selectedDay);
      const logDate = format(addDays(weekStart, dayIndex), "yyyy-MM-dd");

      const response = await fetch("/api/time-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          logDate,
          dayOfWeek: selectedDay,
          projects: validEntries,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save time log");
      }

      toast.success("Time log saved successfully!");
      setEntries([{ projectId: "", hoursLogged: 0, taskDescription: "" }]);

      // Reload the page to refresh the weekly summary
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to save time log");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canLog) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Daily Time Log
          </CardTitle>
          <CardDescription>Available Monday - Thursday only</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Time logging is only available Monday through Thursday. Submit your
            weekly report on Friday!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Time Log</CardTitle>
          <CardDescription>No active project assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You need to be assigned to projects before you can log time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Time</CardTitle>
        <CardDescription>Record hours spent on projects today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Day of Week</Label>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Label>Entry {index + 1}</Label>
                {entries.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>Project</Label>
                <Select
                  value={entry.projectId}
                  onValueChange={(value) =>
                    updateEntry(index, "projectId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((project) => (
                      <SelectItem
                        key={project.projectId}
                        value={project.projectId}
                      >
                        [{project.projectCode}] {project.projectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hours</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={entry.hoursLogged || ""}
                  onChange={(e) =>
                    updateEntry(
                      index,
                      "hoursLogged",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="8.0"
                />
              </div>

              <div className="space-y-2">
                <Label>Task Description</Label>
                <Textarea
                  value={entry.taskDescription}
                  onChange={(e) =>
                    updateEntry(index, "taskDescription", e.target.value)
                  }
                  placeholder="What did you work on?"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addEntry} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Project
        </Button>

        <div className="border-t pt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || totalHours === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Time Log"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
