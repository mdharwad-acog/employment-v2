"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error("Login Failed", {
          description: data.error || "Invalid credentials",
          id: loadingToast,
        });
        return;
      }

      toast.success("Login Successful", {
        description: `Welcome back, ${data.role}!`,
        id: loadingToast,
      });

      const redirectMap: Record<string, string> = {
        HR: "/hr",
        PM: "/pm",
        Leadership: "/executive",
        Employee: "/employee",
      };

      const redirectUrl = from || redirectMap[data.role] || "/employee";
      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    {
      role: "HR",
      email: "hr@company.com",
      password: "hr123",
      color: "bg-blue-100 hover:bg-blue-200",
    },
    {
      role: "PM",
      email: "pm@company.com",
      password: "pm123",
      color: "bg-green-100 hover:bg-green-200",
    },
    {
      role: "Leadership",
      email: "ceo@company.com",
      password: "ceo123",
      color: "bg-purple-100 hover:bg-purple-200",
    },
    {
      role: "Employee",
      email: "dev@company.com",
      password: "dev123",
      color: "bg-orange-100 hover:bg-orange-200",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Resource Allocation System
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3 text-center">
              Demo Credentials:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoCredentials.map((cred) => (
                <Button
                  key={cred.role}
                  variant="outline"
                  size="sm"
                  className={cred.color}
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.password);
                    toast.info(`Credentials filled for ${cred.role}`);
                  }}
                  disabled={isLoading}
                >
                  {cred.role}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
