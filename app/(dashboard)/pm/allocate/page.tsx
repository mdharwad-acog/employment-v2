import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentForm } from "@/components/forms/assignment-form";

export default function AllocateResourcePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Allocate Resource</h1>
        <p className="text-slate-600">Assign an employee to a project</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resource Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm />
        </CardContent>
      </Card>
    </div>
  );
}
