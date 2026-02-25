"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { ArrowRight, BookOpen, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Redirect based on role
      switch (data.user.role) {
        case "TEAM_LEADER":
          router.push("/dashboard");
          break;
        case "COORDINATOR":
          router.push("/coordinator");
          break;
        case "SUPER_ADMIN":
          router.push("/admin");
          break;
        default:
          router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Left Side - Image & Branding */}
      <div className="hidden md:flex md:w-1/2 bg-fpt-blue relative overflow-hidden flex-col justify-center items-center p-12 text-white text-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-55 bg-cover bg-center"
          style={{ backgroundImage: "url('https://www.drisskettani.com/images/projets-detail/1/1.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-fpt-blue/70 to-fpt-green/60 z-0" />
        
        <div className="relative z-10 flex flex-col items-center animate-fade-in w-full">
          {/* Big centered logo */}
          <div className="bg-white p-5 rounded-2xl shadow-2xl mb-10">
            <Image src="http://ene.fpt.ac.ma/logo3_new3%5B172%5D.png" alt="FPT Logo" width={200} height={96} style={{ width: 'auto', height: '96px' }} className="object-contain" priority />
          </div>
          
          <h2 className="text-4xl font-extrabold leading-tight mb-6 animate-slide-up">
            Manage your PFE projects <br/>
            <span className="text-fpt-lightGreen">efficiently and collaboratively.</span>
          </h2>
          <p className="text-lg text-blue-50 max-w-md animate-slide-up" style={{ animationDelay: "0.1s" }}>
            A centralized platform for students, coordinators, and administrators to streamline the end-of-studies project workflow.
          </p>

          <div className="grid grid-cols-2 gap-6 mt-12 animate-slide-up w-full" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 text-left">
              <Users className="w-6 h-6 mb-2 text-fpt-lightGreen" />
              <h3 className="font-semibold">Team Formation</h3>
              <p className="text-sm text-blue-100 mt-1">Easily create and manage your project teams.</p>
            </div>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 text-left">
              <BookOpen className="w-6 h-6 mb-2 text-fpt-lightGreen" />
              <h3 className="font-semibold">Project Tracking</h3>
              <p className="text-sm text-blue-100 mt-1">Submit proposals and track your progress.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header */}
        <div className="absolute top-6 left-6 md:hidden flex items-center gap-2">
          <Image src="http://ene.fpt.ac.ma/logo3_new3%5B172%5D.png" alt="FPT Logo" width={160} height={32} style={{ width: 'auto', height: '32px' }} className="object-contain" />
        </div>

        <div className="w-full max-w-md animate-slide-in-right">
          <div className="text-center mb-8 flex flex-col items-center">
            <Image src="http://ene.fpt.ac.ma/logo3_new3%5B172%5D.png" alt="FPT Logo" width={280} height={64} style={{ width: 'auto', height: '64px' }} className="object-contain mb-6 hidden md:block" />
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500">Please enter your details to sign in.</p>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm animate-fade-in">
                    <p className="font-medium">Authentication Error</p>
                    <p>{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@fpt.ac.ma"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-fpt-blue h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                    <Link href="#" className="text-sm text-fpt-blue hover:text-fpt-green transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-50 border-slate-200 focus-visible:ring-fpt-blue h-11"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pb-6">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-fpt-blue hover:bg-fpt-blue/90 text-white transition-all duration-300 shadow-lg shadow-fpt-blue/30 group" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 w-full">
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
                <p className="text-sm text-center text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/register" className="text-fpt-blue font-semibold hover:text-fpt-green transition-colors">
                    Register here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
