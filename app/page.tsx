import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (session.isLoggedIn) {
    const redirectMap: Record<string, string> = {
      HR: "/hr",
      PM: "/pm",
      Leadership: "/executive",
      Employee: "/employee",
    };

    redirect(redirectMap[session.role] || "/employee");
  }

  redirect("/login");
}
