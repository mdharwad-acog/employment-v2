import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const SKILLS_PATH = join(process.cwd(), "data", "skills.json");

export async function GET(request: NextRequest) {
  try {
    const data = readFileSync(SKILLS_PATH, "utf-8");
    const skills = JSON.parse(data);

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let filtered = skills;

    if (category) {
      filtered = filtered.filter((skill: any) => skill.category === category);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error reading skills:", error);
    return NextResponse.json(
      { error: "Failed to read skills" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = readFileSync(SKILLS_PATH, "utf-8");
    const skills = JSON.parse(data);

    const newId = `skill_${String(skills.length + 1).padStart(3, "0")}`;

    const newSkill = {
      id: newId,
      name: body.name,
      category: body.category,
      description: body.description,
    };

    skills.push(newSkill);
    writeFileSync(SKILLS_PATH, JSON.stringify(skills, null, 2));

    return NextResponse.json(newSkill, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
