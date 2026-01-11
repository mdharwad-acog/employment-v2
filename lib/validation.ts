import { z } from "zod";

export const employeeSchema = z.object({
  employee_id: z.string().min(1, "Employee ID is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  employee_type: z.enum(["Full-Time", "Intern", "Contract"]),
  department: z.string().min(1, "Department is required"),
  working_location: z.string().min(1, "Location is required"),
  is_billable_resource: z.boolean(),
  joining_date: z.string().refine((date) => new Date(date) <= new Date(), {
    message: "Joining date cannot be in the future",
  }),
  base_cost_per_month: z.number().min(0, "Cost must be positive"),
});

export const projectSchema = z
  .object({
    project_code: z.enum(["C", "M", "O", "P", "R", "S", "U", "E"]),
    project_name: z.string().min(1, "Project name is required").max(200),
    client_name: z.string().optional(),
    description: z.string().max(500).optional(),
    start_date: z.string(),
    end_date: z.string().optional(),
    budget_cap: z.number().optional(),
    strategic_importance: z.number().min(1).max(10),
    status: z.enum(["Planning", "Active", "On-Hold", "Completed", "Archived"]),
  })
  .refine(
    (data) => {
      if (["C", "U", "E", "S"].includes(data.project_code)) {
        return !!data.client_name;
      }
      return true;
    },
    {
      message: "Client name is required for client projects",
      path: ["client_name"],
    }
  );

export const assignmentSchema = z.object({
  employee_id: z.string().min(1, "Employee is required"),
  project_id: z.string().min(1, "Project is required"),
  role: z.string().min(1, "Role is required"),
  allocation_percentage: z
    .number()
    .min(1, "Allocation must be at least 1%")
    .max(100, "Allocation cannot exceed 100%"),
  date_allocated: z.string(),
});

export const timeLogSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  log_date: z.string(),
  hours: z
    .number()
    .min(0.1, "Hours must be at least 0.1")
    .max(24, "Hours cannot exceed 24"),
  notes: z.string().optional(),
});
