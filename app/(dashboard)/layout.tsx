import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  const navLinks = {
    HR: [
      { href: "/hr", label: "Dashboard" },
      { href: "/hr/employees", label: "Employees" },
    ],
    PM: [
      { href: "/pm", label: "Dashboard" },
      { href: "/pm/allocate", label: "Allocate" },
    ],
    Leadership: [
      { href: "/executive", label: "Executive" },
      { href: "/hr", label: "HR View" },
      { href: "/pm", label: "PM View" },
    ],
    Employee: [{ href: "/employee", label: "Dashboard" }],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-slate-900">
                Resource Allocation
              </Link>
              <div className="flex space-x-4">
                {navLinks[session.role]?.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                {session.email} ({session.role})
              </span>
              <form action="/api/auth/logout" method="POST">
                <Button variant="outline" size="sm" type="submit">
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
