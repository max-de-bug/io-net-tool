"use client";

import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Mail, Github, Chrome } from "lucide-react";

export default function AuthChoisePage() {
  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
            <Zap className="h-8 w-8 text-background" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">io.net</h1>
            <p className="text-sm text-muted-foreground">Worker Manager</p>
          </div>
        </div>

        <Card className="glass border-border/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage your io.net infrastructure
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-12"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <Chrome className="h-5 w-5" />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-12"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <Github className="h-5 w-5" />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full justify-start gap-3 h-12"
              onClick={() => signIn("twitter", { callbackUrl: "/dashboard" })}
            >
              <Image
                src="/twitterX.png"
                alt="X"
                width={20}
                height={20}
                className="invert"
              />
              Continue with X
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Email Auth */}
            <Link href="/emailAuth" className="block">
              <Button
                variant="secondary"
                size="lg"
                className="w-full justify-start gap-3 h-12"
              >
                <Mail className="h-5 w-5" />
                Continue with Email
              </Button>
            </Link>

            {/* Terms */}
            <p className="text-xs text-center text-muted-foreground pt-4">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Secure access to your distributed compute infrastructure
        </p>
      </div>
    </div>
  );
}
