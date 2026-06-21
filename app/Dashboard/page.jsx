"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calculator, Settings, Sparkles, TrendingUp } from "lucide-react";
import { useCalculator } from "../contexts/CalculatorContext";
import { Badge } from "../components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const { calculatorData } = useCalculator();
  const Router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Removed login redirect; allowing guest access
  }, []);

  const hasPreviousCalculation = calculatorData.cgpa !== null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Welcome to CGPA Calculator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your academic performance and get AI-powered suggestions
            </p>
          </div>

          {/* Previous CGPA Card */}
          {hasPreviousCalculation && (
            <Card className="border border-primary/20 bg-primary/5 text-foreground rounded-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground font-extrabold text-lg">
                      Your Current CGPA
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs mt-0.5">
                      Based on your last calculation
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/25 font-semibold rounded-full px-3 py-0.5 text-xs">
                    {calculatorData.calculationType === "sessionals"
                      ? "Sessionals Only"
                      : "Complete"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="text-5xl font-black tracking-tight text-primary">
                    {calculatorData.cgpa?.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span>{calculatorData.courses.length} Courses</span>
                    </div>
                    <div>
                      Total Credits:{" "}
                      <span className="font-semibold text-foreground">
                        {calculatorData.courses.reduce(
                          (sum, c) => sum + c.creditHours,
                          0,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Actions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Calculate CGPA */}
            <Link href="/Calculator">
              <Card className="card-premium h-full cursor-pointer p-6 flex flex-col justify-between hover:border-primary/40">
                <div>
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Calculate CGPA</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Enter your courses and calculate your CGPA
                  </CardDescription>
                </div>
              </Card>
            </Link>

            {/* Formula Settings */}
            <Link href="/FormulaSettings">
              <Card className="card-premium h-full cursor-pointer p-6 flex flex-col justify-between hover:border-primary/40">
                <div>
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
                    <Settings className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">Formula Settings</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Customize weightage and grade boundaries
                  </CardDescription>
                </div>
              </Card>
            </Link>

            {/* AI Suggestions */}
            <Link href="/AISuggestions">
              <Card className="card-premium h-full cursor-pointer p-6 flex flex-col justify-between hover:border-primary/40">
                <div>
                  <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base font-bold text-foreground">AI Suggestions</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-1">
                    Get insights on courses to improve
                  </CardDescription>
                </div>
              </Card>
            </Link>

            {/* View Results */}
            {hasPreviousCalculation && (
              <Link href="/Calculator">
                <Card className="card-premium h-full cursor-pointer p-6 flex flex-col justify-between hover:border-primary/40">
                  <div>
                    <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base font-bold text-foreground">View Results</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-1">
                      See detailed breakdown of your CGPA
                    </CardDescription>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Quick Start */}
          {!hasPreviousCalculation && (
            <Card className="rounded-xl border border-border bg-card micro-shadow p-6 md:p-8">
              <CardHeader className="px-0 pt-0 pb-6 border-b border-border">
                <CardTitle className="text-lg font-bold text-foreground">Get Started</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Calculate your CGPA in four simple steps
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      Choose Calculation Type
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      Sessionals only or complete CGPA
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Confirm Formula</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      Review weights and grade boundaries
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Fill Course Details</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      Add course names, credits, and marks
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center mx-auto font-bold text-sm">
                      4
                    </div>
                    <h3 className="text-sm font-bold text-foreground">Get Your CGPA</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">
                      View your results and AI suggestions
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <Button
                    asChild
                    className="btn-premium-primary text-sm h-10 rounded-lg px-6"
                  >
                    <Link href="/Calculator">Start Calculating</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
