import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { mockDB } from "@/lib/mock-db";
import { canManageAssignments } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn || !canManageAssignments(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      from_assignment_id,
      to_project_id,
      allocation,
      transfer_type,
      date,
    } = body;

    // Get original assignment
    const assignments = mockDB.getAssignments();
    const originalAssignment = assignments.find(
      (a) => a.assignment_id === from_assignment_id
    );

    if (!originalAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Mark old assignment as Transferred
    mockDB.updateAssignment(from_assignment_id, {
      status: "Transferred",
      date_exited: date,
    });

    // Create new assignment
    const newAssignment = mockDB.createAssignment({
      assignment_id: `ASG${Date.now()}`,
      employee_id: originalAssignment.employee_id,
      project_id: to_project_id,
      role: originalAssignment.role,
      allocation_percentage: allocation,
      date_allocated: date,
      date_exited: null,
      status: "Active",
      transfer_type,
      replaced_assignment_id: from_assignment_id,
      is_critical_resource: false,
      criticality_notes: null,
      criticality_set_date: null,
      criticality_set_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if ("error" in newAssignment) {
      // Rollback
      mockDB.updateAssignment(from_assignment_id, {
        status: "Active",
        date_exited: null,
      });
      return NextResponse.json(newAssignment, { status: 400 });
    }

    return NextResponse.json({ success: true, assignment: newAssignment });
  } catch (error) {
    return NextResponse.json({ error: "Transfer failed" }, { status: 500 });
  }
}
