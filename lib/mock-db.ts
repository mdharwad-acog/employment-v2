import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type {
  Employee,
  Project,
  ProjectAssignment,
  User,
  Skill,
  EmployeeSkill,
} from "@/types";

const dataDir = join(process.cwd(), "data");

class MockDatabase {
  private getFilePath(filename: string): string {
    return join(dataDir, filename);
  }

  private readJSON<T>(filename: string): T[] {
    try {
      const filePath = this.getFilePath(filename);
      const content = readFileSync(filePath, "utf-8");
      return JSON.parse(content) as T[];
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      return [];
    }
  }

  private writeJSON<T>(filename: string, data: T[]): void {
    try {
      const filePath = this.getFilePath(filename);
      writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error(`Error writing ${filename}:`, error);
    }
  }

  // Users
  getUsers(): User[] {
    return this.readJSON<User>("users.json");
  }

  getUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email === email);
  }

  // Employees
  getEmployees(): Employee[] {
    return this.readJSON<Employee>("employees.json");
  }

  getEmployeeById(id: string): Employee | undefined {
    const employees = this.getEmployees();
    return employees.find((e) => e.employee_id === id);
  }

  createEmployee(employee: Employee): Employee {
    const employees = this.getEmployees();
    employees.push(employee);
    this.writeJSON("employees.json", employees);
    return employee;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const employees = this.getEmployees();
    const index = employees.findIndex((e) => e.employee_id === id);
    if (index === -1) return null;

    employees[index] = {
      ...employees[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.writeJSON("employees.json", employees);
    return employees[index];
  }

  // Projects
  getProjects(): Project[] {
    return this.readJSON<Project>("projects.json");
  }

  getProjectById(id: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find((p) => p.project_id === id);
  }

  createProject(project: Project): Project {
    const projects = this.getProjects();
    projects.push(project);
    this.writeJSON("projects.json", projects);
    return project;
  }

  // Assignments
  getAssignments(): ProjectAssignment[] {
    return this.readJSON<ProjectAssignment>("assignments.json");
  }

  getAssignmentsByEmployeeId(employeeId: string): ProjectAssignment[] {
    const assignments = this.getAssignments();
    return assignments.filter((a) => a.employee_id === employeeId);
  }

  getActiveAssignmentsByEmployeeId(employeeId: string): ProjectAssignment[] {
    return this.getAssignmentsByEmployeeId(employeeId).filter(
      (a) => a.status === "Active"
    );
  }

  getAssignmentsByProjectId(projectId: string): ProjectAssignment[] {
    const assignments = this.getAssignments();
    return assignments.filter((a) => a.project_id === projectId);
  }

  createAssignment(
    assignment: ProjectAssignment
  ): ProjectAssignment | { error: string } {
    const employee = this.getEmployeeById(assignment.employee_id);
    if (!employee || !employee.is_billable_resource) {
      const assignments = this.getAssignments();
      assignments.push(assignment);
      this.writeJSON("assignments.json", assignments);
      return assignment;
    }

    const activeAssignments = this.getActiveAssignmentsByEmployeeId(
      assignment.employee_id
    );
    const currentAllocation = activeAssignments.reduce(
      (sum, a) => sum + a.allocation_percentage,
      0
    );
    const newTotal = currentAllocation + assignment.allocation_percentage;

    if (newTotal > 100) {
      return {
        error: `Allocation exceeds 100%. Current: ${currentAllocation}%, Requested: ${assignment.allocation_percentage}%, Would be: ${newTotal}%`,
      };
    }

    const assignments = this.getAssignments();
    assignments.push(assignment);
    this.writeJSON("assignments.json", assignments);
    return assignment;
  }

  updateAssignment(
    id: string,
    updates: Partial<ProjectAssignment>
  ): ProjectAssignment | null {
    const assignments = this.getAssignments();
    const index = assignments.findIndex((a) => a.assignment_id === id);
    if (index === -1) return null;

    assignments[index] = {
      ...assignments[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.writeJSON("assignments.json", assignments);
    return assignments[index];
  }

  // Skills
  getSkills(): Skill[] {
    return this.readJSON<Skill>("skills.json");
  }

  getEmployeeSkills(employeeId: string): EmployeeSkill[] {
    const employeeSkills = this.readJSON<EmployeeSkill>("employee-skills.json");
    return employeeSkills.filter((es) => es.employee_id === employeeId);
  }

  // Business logic helpers
  calculateEmployeeAllocation(employeeId: string): number {
    const activeAssignments = this.getActiveAssignmentsByEmployeeId(employeeId);
    return activeAssignments.reduce(
      (sum, a) => sum + a.allocation_percentage,
      0
    );
  }

  calculateProjectMonthlyCost(projectId: string): number {
    const assignments = this.getAssignmentsByProjectId(projectId).filter(
      (a) => a.status === "Active"
    );
    let totalCost = 0;

    for (const assignment of assignments) {
      const employee = this.getEmployeeById(assignment.employee_id);
      if (!employee || !employee.is_billable_resource) continue;

      const mpf = (employee.base_cost_per_month * 1.3) / 160;
      const monthlyCost = mpf * (assignment.allocation_percentage / 100) * 160;
      totalCost += monthlyCost;
    }

    return Math.round(totalCost);
  }
}

export const mockDB = new MockDatabase();
