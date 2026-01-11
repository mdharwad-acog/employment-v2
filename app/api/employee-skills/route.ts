import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const EMPLOYEE_SKILLS_PATH = join(
  process.cwd(),
  "data",
  "employee-skills.json"
);
const SKILLS_PATH = join(process.cwd(), "data", "skills.json");

export async function GET(request: NextRequest) {
  try {
    const employeeSkillsData = readFileSync(EMPLOYEE_SKILLS_PATH, "utf-8");
    const skillsData = readFileSync(SKILLS_PATH, "utf-8");

    const employeeSkills = JSON.parse(employeeSkillsData);
    const skills = JSON.parse(skillsData);

    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const skillId = searchParams.get("skillId");

    let filtered = employeeSkills;

    if (employeeId) {
      filtered = filtered.filter((es: any) => es.employee_id === employeeId);
    }

    if (skillId) {
      filtered = filtered.filter((es: any) => es.skill_id === skillId);
    }

    // Enrich with skill details
    const enriched = filtered.map((es: any) => {
      const skill = skills.find((s: any) => s.id === es.skill_id);
      return {
        ...es,
        skillName: skill?.name || "Unknown",
        skillCategory: skill?.category || "Unknown",
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Error reading employee skills:", error);
    return NextResponse.json(
      { error: "Failed to read employee skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readFileSync(EMPLOYEE_SKILLS_PATH, "utf-8");
    const employeeSkills = JSON.parse(data);

    const newId = `es_${String(employeeSkills.length + 1).padStart(3, "0")}`;

    const newEmployeeSkill = {
      id: newId,
      employee_id: body.employee_id,
      skill_id: body.skill_id,
      proficiency_level: body.proficiency_level,
      years_of_experience: body.years_of_experience,
      last_used_date: body.last_used_date,
      acquired_date: body.acquired_date,
    };

    employeeSkills.push(newEmployeeSkill);
    writeFileSync(
      EMPLOYEE_SKILLS_PATH,
      JSON.stringify(employeeSkills, null, 2)
    );

    return NextResponse.json(newEmployeeSkill, { status: 201 });
  } catch (error) {
    console.error("Error creating employee skill:", error);
    return NextResponse.json(
      { error: "Failed to create employee skill" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readFileSync(EMPLOYEE_SKILLS_PATH, "utf-8");
    let employeeSkills = JSON.parse(data);

    const index = employeeSkills.findIndex((es: any) => es.id === body.id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Employee skill not found" },
        { status: 404 }
      );
    }

    employeeSkills[index] = {
      ...employeeSkills[index],
      proficiency_level: body.proficiency_level,
      years_of_experience: body.years_of_experience,
      last_used_date: body.last_used_date,
    };

    writeFileSync(
      EMPLOYEE_SKILLS_PATH,
      JSON.stringify(employeeSkills, null, 2)
    );

    return NextResponse.json(employeeSkills[index]);
  } catch (error) {
    console.error("Error updating employee skill:", error);
    return NextResponse.json(
      { error: "Failed to update employee skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const data = readFileSync(EMPLOYEE_SKILLS_PATH, "utf-8");
    let employeeSkills = JSON.parse(data);

    employeeSkills = employeeSkills.filter((es: any) => es.id !== id);

    writeFileSync(
      EMPLOYEE_SKILLS_PATH,
      JSON.stringify(employeeSkills, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting employee skill:", error);
    return NextResponse.json(
      { error: "Failed to delete employee skill" },
      { status: 500 }
    );
  }
}
