"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { assignmentSchema } from "@/lib/validation";
import type { Employee, Project } from "@/types";

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export function AssignmentForm({ projectId, onSuccess }: AssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/employees").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ]).then(([emps, projs]) => {
      setEmployees(
        emps.filter(
          (e: Employee) => e.status === "Active" && e.is_billable_resource
        )
      );
      setProjects(projs);
    });
  }, []);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      employee_id: "",
      project_id: projectId || "",
      role: "",
      allocation_percentage: 0,
      date_allocated: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(data: AssignmentFormValues) {
    setIsLoading(true);
    const loadingToast = toast.loading("Assigning resource...");

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          assignment_id: `ASG${Date.now()}`,
          status: "Active",
          transfer_type: "New",
          date_exited: null,
          replaced_assignment_id: null,
          is_critical_resource: false,
          criticality_notes: null,
          criticality_set_date: null,
          criticality_set_by: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if ("error" in result) {
        throw new Error(result.error);
      }

      const employee = employees.find(
        (e) => e.employee_id === data.employee_id
      );
      toast.success("Assignment Created", {
        description: `${employee?.name} assigned to project with ${data.allocation_percentage}% allocation`,
        id: loadingToast,
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error("Allocation Failed", {
        description: error.message,
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employee_id} value={emp.employee_id}>
                      {emp.name} ({emp.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {!projectId && (
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((proj) => (
                      <SelectItem key={proj.project_id} value={proj.project_id}>
                        {proj.project_id} - {proj.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Input placeholder="Full-Stack Developer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allocation_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocation Percentage</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="50"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                1-100%. System enforces 100% total limit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_allocated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Assigning..." : "Assign Resource"}
        </Button>
      </form>
    </Form>
  );
}
