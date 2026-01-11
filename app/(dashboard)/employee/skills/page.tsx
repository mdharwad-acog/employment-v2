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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Award, TrendingUp, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  skillName: string;
  skillCategory: string;
  proficiency_level: string;
  years_of_experience: number;
  last_used_date: string;
  acquired_date: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export default function EmployeeSkillsPage() {
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<EmployeeSkill | null>(null);

  const employeeId = "EMP001"; // In production, get from session

  const [formData, setFormData] = useState({
    skill_id: "",
    proficiency_level: "Intermediate",
    years_of_experience: 1,
    last_used_date: format(new Date(), "yyyy-MM-dd"),
    acquired_date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empSkillsRes, skillsRes] = await Promise.all([
        fetch(`/api/employee-skills?employeeId=${employeeId}`),
        fetch("/api/skills"),
      ]);

      const empSkillsData = await empSkillsRes.json();
      const skillsData = await skillsRes.json();

      setEmployeeSkills(empSkillsData);
      setAllSkills(skillsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!formData.skill_id) {
      toast.error("Please select a skill");
      return;
    }

    try {
      const response = await fetch("/api/employee-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to add skill");

      toast.success("Skill added successfully!");
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error("Failed to add skill");
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    try {
      const response = await fetch("/api/employee-skills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSkill.id,
          ...formData,
        }),
      });

      if (!response.ok) throw new Error("Failed to update skill");

      toast.success("Skill updated successfully!");
      setIsDialogOpen(false);
      setEditingSkill(null);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error("Failed to update skill");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;

    try {
      const response = await fetch(`/api/employee-skills?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete skill");

      toast.success("Skill removed successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to remove skill");
    }
  };

  const resetForm = () => {
    setFormData({
      skill_id: "",
      proficiency_level: "Intermediate",
      years_of_experience: 1,
      last_used_date: format(new Date(), "yyyy-MM-dd"),
      acquired_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const openEditDialog = (skill: EmployeeSkill) => {
    setEditingSkill(skill);
    setFormData({
      skill_id: skill.skill_id,
      proficiency_level: skill.proficiency_level,
      years_of_experience: skill.years_of_experience,
      last_used_date: skill.last_used_date,
      acquired_date: skill.acquired_date,
    });
    setIsDialogOpen(true);
  };

  const getProficiencyColor = (level: string) => {
    const colors = {
      Beginner: "bg-blue-500",
      Intermediate: "bg-green-500",
      Advanced: "bg-orange-500",
      Expert: "bg-purple-500",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  const getProficiencyValue = (level: string) => {
    const values = {
      Beginner: 25,
      Intermediate: 50,
      Advanced: 75,
      Expert: 100,
    };
    return values[level as keyof typeof values] || 0;
  };

  const groupedSkills = employeeSkills.reduce((acc, skill) => {
    if (!acc[skill.skillCategory]) {
      acc[skill.skillCategory] = [];
    }
    acc[skill.skillCategory].push(skill);
    return acc;
  }, {} as Record<string, EmployeeSkill[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Skills</h1>
          <p className="text-muted-foreground">
            Manage your professional skills and expertise
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingSkill(null);
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSkill ? "Edit Skill" : "Add New Skill"}
              </DialogTitle>
              <DialogDescription>
                {editingSkill
                  ? "Update your skill proficiency"
                  : "Add a new skill to your profile"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Skill</Label>
                <Select
                  value={formData.skill_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skill_id: value })
                  }
                  disabled={!!editingSkill}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {allSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name} ({skill.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Proficiency Level</Label>
                <Select
                  value={formData.proficiency_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, proficiency_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.years_of_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      years_of_experience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Last Used Date</Label>
                <Input
                  type="date"
                  value={formData.last_used_date}
                  onChange={(e) =>
                    setFormData({ ...formData, last_used_date: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full"
                onClick={editingSkill ? handleUpdateSkill : handleAddSkill}
              >
                {editingSkill ? "Update Skill" : "Add Skill"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeSkills.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {Object.keys(groupedSkills).length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expert Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employeeSkills.filter((s) => s.proficiency_level === "Expert")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Advanced expertise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Experience
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeSkills.length > 0
                ? (
                    employeeSkills.reduce(
                      (sum, s) => sum + s.years_of_experience,
                      0
                    ) / employeeSkills.length
                  ).toFixed(1)
                : 0}{" "}
              years
            </div>
            <p className="text-xs text-muted-foreground">Per skill average</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading skills...</div>
      ) : employeeSkills.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No skills added yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>
                  {skills.length} skills in this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{skill.skillName}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">
                            {skill.proficiency_level}
                          </Badge>
                          <Badge variant="secondary">
                            {skill.years_of_experience} years
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(skill)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSkill(skill.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Proficiency
                        </span>
                        <span className="font-medium">
                          {skill.proficiency_level}
                        </span>
                      </div>
                      <Progress
                        value={getProficiencyValue(skill.proficiency_level)}
                        className="h-2"
                      />
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Last used:{" "}
                        {format(new Date(skill.last_used_date), "MMM d, yyyy")}
                      </span>
                      <span>
                        Since: {format(new Date(skill.acquired_date), "yyyy")}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
