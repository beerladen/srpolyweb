"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLogo } from "@/components/auth/auth-logo";
import { SocialButton } from "@/components/auth/social-button";
import { Divider } from "@/components/auth/divider";
import { PasswordInput } from "@/components/auth/password-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate signup process
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirect to home after successful signup
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <AuthLogo />

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome to PodCat! Create an account to get started!
        </p>
      </div>

      {/* Social Buttons */}
      <div className="space-y-3">
        <SocialButton provider="google" action="signup" />
        <SocialButton provider="github" action="signup" />
      </div>

      <Divider />

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 py-5 text-white hover:bg-purple-700"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Continue"}
        </Button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/signin"
          className="font-medium text-purple-500 hover:text-purple-400"
        >
          Sign in
        </Link>
      </p>

      {/* Terms of Service */}
      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link
          href="/terms"
          className="text-purple-500 hover:text-purple-400"
          target="_blank"
        >
          Terms of Service ↗
        </Link>
      </p>
    </div>
  );
}
