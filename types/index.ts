export type EmployeeType = "Full-Time" | "Intern" | "Contract";
export type EmployeeStatus = "Active" | "Exited";
export type ProjectCode = "C" | "M" | "O" | "P" | "R" | "S" | "U" | "E";
export type ProjectStatus =
  | "Planning"
  | "Active"
  | "On-Hold"
  | "Completed"
  | "Archived";
export type AssignmentStatus = "Active" | "Completed" | "Transferred";
export type TransferType =
  | "New"
  | "Transfer-Internal"
  | "Transfer-Client"
  | "Backfill";
export type UserRole = "HR" | "PM" | "Leadership" | "Employee";
export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Design"
  | "QA"
  | "DevOps"
  | "Soft-Skills"
  | "Domain";
export type ProficiencyLevel =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Expert";

export interface Employee {
  employee_id: string;
  name: string;
  email: string;
  employee_type: EmployeeType;
  department: string;
  working_location: string;
  status: EmployeeStatus;
  is_billable_resource: boolean;
  joining_date: string;
  exit_date: string | null;
  base_cost_per_month: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  project_id: string;
  project_code: ProjectCode;
  project_name: string;
  client_name: string | null;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string | null;
  budget_cap: number | null;
  strategic_importance: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectAssignment {
  assignment_id: string;
  employee_id: string;
  project_id: string;
  role: string;
  allocation_percentage: number;
  date_allocated: string;
  date_exited: string | null;
  status: AssignmentStatus;
  transfer_type: TransferType;
  replaced_assignment_id: string | null;
  is_critical_resource: boolean;
  criticality_notes: string | null;
  criticality_set_date: string | null;
  criticality_set_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  skill_id: number;
  skill_name: string;
  skill_category: SkillCategory;
}

export interface EmployeeSkill {
  employee_skill_id: number;
  employee_id: string;
  skill_id: number;
  proficiency_level: ProficiencyLevel;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  employee_id: string | null;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  employee_id: string | null;
  isLoggedIn: boolean;
}

export interface DailyTimeLog {
  id: string;
  employeeId: string;
  logDate: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  projects: {
    projectId: string;
    hoursLogged: number;
    taskDescription: string;
  }[];
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  employeeId: string;
  reportType: "Weekly" | "Daily";
  reportDate: string;
  weekStartDate?: string;
  weekEndDate?: string;
  content: string;
  status: "Draft" | "Submitted";
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  employeeId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalHours: number;
  projectBreakdown: {
    projectId: string;
    projectName: string;
    totalHours: number;
    tasks: string[];
  }[];
  dailyLogs: DailyTimeLog[];
}
