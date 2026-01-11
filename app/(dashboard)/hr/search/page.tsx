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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Users,
  Award,
  MapPin,
  Briefcase,
  Mail,
  Filter,
} from "lucide-react";

interface Employee {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  employee_type: string;
  working_location: string;
  is_billable_resource: boolean;
}

interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  skillName: string;
  skillCategory: string;
  proficiency_level: string;
  years_of_experience: number;
}

interface Assignment {
  employee_id: string;
  allocation_percentage: number;
}

interface SearchFilters {
  skill: string;
  proficiency: string;
  location: string;
  department: string;
  employeeType: string;
  minExperience: string;
}

export default function ResourceSearchPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<SearchFilters>({
    skill: "all",
    proficiency: "all",
    location: "all",
    department: "all",
    employeeType: "all",
    minExperience: "0",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, employees, employeeSkills]);

  const fetchData = async () => {
    try {
      const [empRes, skillsRes, empSkillsRes, assignRes] = await Promise.all([
        fetch("/api/employees"),
        fetch("/api/skills"),
        fetch("/api/employee-skills"),
        fetch("/api/assignments"),
      ]);

      const empData = await empRes.json();
      const skillsData = await skillsRes.json();
      const empSkillsData = await empSkillsRes.json();
      const assignData = await assignRes.json();

      setEmployees(empData);
      setSkills(skillsData);
      setEmployeeSkills(empSkillsData);
      setAssignments(assignData);
      setFilteredEmployees(empData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Filter by skill
    if (filters.skill && filters.skill !== "all") {
      const empIdsWithSkill = employeeSkills
        .filter((es) => {
          const matchesSkill = es.skill_id === filters.skill;
          const matchesProficiency =
            filters.proficiency === "all" ||
            es.proficiency_level === filters.proficiency;
          const matchesExperience =
            es.years_of_experience >= parseInt(filters.minExperience);
          return matchesSkill && matchesProficiency && matchesExperience;
        })
        .map((es) => es.employee_id);

      filtered = filtered.filter((e) =>
        empIdsWithSkill.includes(e.employee_id)
      );
    }

    // Filter by location
    if (filters.location !== "all") {
      filtered = filtered.filter(
        (e) => e.working_location === filters.location
      );
    }

    // Filter by department
    if (filters.department !== "all") {
      filtered = filtered.filter((e) => e.department === filters.department);
    }

    // Filter by employee type
    if (filters.employeeType !== "all") {
      filtered = filtered.filter(
        (e) => e.employee_type === filters.employeeType
      );
    }

    setFilteredEmployees(filtered);
  };

  const getEmployeeSkills = (employeeId: string) => {
    return employeeSkills.filter((es) => es.employee_id === employeeId);
  };

  const getEmployeeAllocation = (employeeId: string) => {
    const empAssignments = assignments.filter(
      (a) => a.employee_id === employeeId
    );
    const total = empAssignments.reduce(
      (sum, a) => sum + a.allocation_percentage,
      0
    );
    return Math.min(total, 100);
  };

  const getAvailability = (employeeId: string) => {
    const allocated = getEmployeeAllocation(employeeId);
    return 100 - allocated;
  };

  const uniqueLocations = [
    ...new Set(employees.map((e) => e.working_location)),
  ];
  const uniqueDepartments = [...new Set(employees.map((e) => e.department))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resource Search</h1>
        <p className="text-muted-foreground">
          Find employees by skills, availability, and attributes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search Filters
          </CardTitle>
          <CardDescription>Refine your search criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select
                value={filters.skill}
                onValueChange={(value) =>
                  setFilters({ ...filters, skill: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <Select
                value={filters.proficiency}
                onValueChange={(value) =>
                  setFilters({ ...filters, proficiency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Min. Experience (years)</Label>
              <Input
                type="number"
                min="0"
                value={filters.minExperience}
                onChange={(e) =>
                  setFilters({ ...filters, minExperience: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={filters.location}
                onValueChange={(value) =>
                  setFilters({ ...filters, location: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) =>
                  setFilters({ ...filters, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee Type</Label>
              <Select
                value={filters.employeeType}
                onValueChange={(value) =>
                  setFilters({ ...filters, employeeType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full Time">Full Time</SelectItem>
                  <SelectItem value="Intern">Intern</SelectItem>
                  <SelectItem value="Contractor">Contractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  skill: "all",
                  proficiency: "all",
                  location: "all",
                  department: "all",
                  employeeType: "all",
                  minExperience: "0",
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Search Results
          </CardTitle>
          <CardDescription>
            Found {filteredEmployees.length} employees matching your criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No employees found matching your criteria
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => {
                const empSkills = getEmployeeSkills(employee.employee_id);
                const availability = getAvailability(employee.employee_id);

                return (
                  <Card key={employee.employee_id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {employee.name}
                      </CardTitle>
                      <CardDescription>{employee.department}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.working_location}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.employee_type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{employee.email}</span>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm font-medium mb-2">
                          Skills ({empSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {empSkills.slice(0, 3).map((skill) => (
                            <Badge
                              key={skill.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill.skillName}
                            </Badge>
                          ))}
                          {empSkills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{empSkills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">
                            Availability
                          </span>
                          <span
                            className={`font-medium ${
                              availability >= 50
                                ? "text-green-600"
                                : availability >= 25
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {availability}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              availability >= 50
                                ? "bg-green-500"
                                : availability >= 25
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${availability}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
