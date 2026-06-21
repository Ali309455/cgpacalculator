"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { useTheme } from "next-themes";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Badge } from "./components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./components/ui/card";
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calculator, 
  AlertTriangle, 
  ArrowRight, 
  Sun, 
  Moon, 
  CheckCircle2, 
  TrendingUp, 
  Layers,
  BookOpen,
  LineChart,
  BrainCircuit,
  Settings2
} from "lucide-react";
import { toast } from "sonner";

// Grading scale matching default CalculatorContext
const GRADE_POINTS = {
  "A+": 4.0,
  "A": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "C+": 2.7,
  "C": 2.3,
  "D": 2.0,
  "F": 0.0,
};

// Custom intersection observer hook for triggering reveals
function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.triggerOnce !== false) {
          observer.unobserve(entry.target);
        }
      } else if (options.triggerOnce === false) {
        setIsVisible(false);
      }
    }, options);

    const currentEl = elementRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [options]);

  return [elementRef, isVisible];
}

// Smooth tick counter component
function AnimatedCounter({ value, duration = 800, decimals = 2 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [elementRef, isVisible] = useIntersectionObserver({ triggerOnce: true, threshold: 0.1 });
  const valueRef = React.useRef(value);
  const prevValueRef = React.useRef(0);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!isVisible) return;

    let start = null;
    const startValue = prevValueRef.current;
    const endValue = valueRef.current;
    const diff = endValue - startValue;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing curve cubic-bezier(0.16, 1, 0.3, 1)
      const ease = 1 - Math.pow(1 - percentage, 4);
      const current = startValue + diff * ease;
      
      setDisplayValue(current);

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, isVisible, duration]);

  return <span ref={elementRef}>{displayValue.toFixed(decimals)}</span>;
}

// Animated wrapper for staggering entry
function AnimatedSection({ children, delay = 0, className = "" }) {
  const [elementRef, isVisible] = useIntersectionObserver({ triggerOnce: true, threshold: 0.05 });
  return (
    <div
      ref={elementRef}
      style={{ animationDelay: `${delay}ms` }}
      className={`${className} reveal-hidden ${isVisible ? "reveal-visible" : ""}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loginAsGuest } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Sandbox State
  const [sandboxCourses, setSandboxCourses] = useState([
    { id: "1", name: "Introduction to AI", creditHours: 3, grade: "A" },
    { id: "2", name: "Advanced Calculus", creditHours: 4, grade: "B+" },
    { id: "3", name: "Database Systems", creditHours: 3, grade: "A+" }
  ]);
  const [sandboxGpa, setSandboxGpa] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate GPA when sandbox courses change
  useEffect(() => {
    let totalPoints = 0;
    let totalCredits = 0;

    sandboxCourses.forEach((c) => {
      const credit = Number(c.creditHours) || 0;
      const points = GRADE_POINTS[c.grade] ?? 0;
      totalPoints += points * credit;
      totalCredits += credit;
    });

    const calculated = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    setSandboxGpa(calculated);
  }, [sandboxCourses]);

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  const handleStartCalculating = () => {
    if (user) {
      router.push("/Dashboard");
    } else {
      loginAsGuest();
      toast.success("Welcome! Entered as a Guest Student.");
      router.push("/Dashboard");
    }
  };

  const addSandboxCourse = () => {
    const nextId = (Math.max(...sandboxCourses.map(c => Number(c.id) || 0), 0) + 1).toString();
    setSandboxCourses([
      ...sandboxCourses,
      { id: nextId, name: `Course ${nextId}`, creditHours: 3, grade: "A" }
    ]);
  };

  const removeSandboxCourse = (id) => {
    if (sandboxCourses.length <= 1) {
      toast.error("You need at least one course to calculate GPA.");
      return;
    }
    setSandboxCourses(sandboxCourses.filter(c => c.id !== id));
  };

  const updateSandboxCourse = (id, field, value) => {
    setSandboxCourses(sandboxCourses.map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-6 py-4 max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-2 rounded-lg micro-shadow">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              CGPA Calculator
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#simulator" className="hover:text-foreground transition-colors">Sandbox</a>
            <a href="#problems" className="hover:text-foreground transition-colors">The Challenge</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg border-border hover:bg-muted/40 transition-all text-muted-foreground hover:text-foreground h-9 w-9"
            >
              {mounted && (resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              ))}
            </Button>

            {user ? (
              <Button onClick={() => router.push("/Dashboard")} className="rounded-lg btn-premium-primary text-sm h-9">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 text-sm h-9 hidden sm:inline-flex">
                  <Link href="/Login">Sign In</Link>
                </Button>
                <Button asChild className="rounded-lg bg-primary hover:bg-primary/95 text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-sm h-9">
                  <Link href="/SignUp">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-7xl relative z-10 space-y-24">
        
        {/* Hero & Sandbox Split */}
        <section id="simulator" className="grid lg:grid-cols-12 gap-12 items-center pt-4">
          
          {/* Hero Left */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3.5 py-1 text-xs font-semibold rounded-full w-fit mx-auto lg:mx-0">
              🎓 Clinical Grade Simulator & Planner
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              The GPA Struggle is Real.{" "}
              <span className="block mt-1 text-primary">
                We've Simplified It.
              </span>
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Managing varying grade boundaries, complex sessional ratios, and lab percentages manually is tedious and error-prone. Enter your semesters, customize templates, and unlock clear paths to your target CGPA.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Button 
                onClick={handleStartCalculating} 
                className="btn-premium-primary text-sm py-5 px-6 rounded-lg"
              >
                Start Calculating Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  const element = document.getElementById("problems");
                  element?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-premium-secondary text-sm py-5 rounded-lg"
              >
                Why spreadsheets fail
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                No registration required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Custom university scales
              </div>
            </div>
          </div>

          {/* Sandbox Right */}
          <div className="lg:col-span-6">
            <Card className="rounded-xl border border-border bg-card micro-shadow p-6 md:p-8">
              
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Sandbox Simulator
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time instant calculation</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">Semester GPA</span>
                  <span className="text-4xl font-extrabold tracking-tight text-primary transition-all duration-300">
                    <AnimatedCounter value={sandboxGpa} />
                  </span>
                </div>
              </div>

              {/* Course rows container */}
              <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                {sandboxCourses.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-border/60 transition-all hover:border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <Input
                        type="text"
                        value={c.name}
                        onChange={(e) => updateSandboxCourse(c.id, "name", e.target.value)}
                        placeholder="Course Name"
                        className="bg-transparent border-0 h-8 p-0 text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 text-ellipsis overflow-hidden focus:outline-none"
                      />
                    </div>

                    {/* Credit hours */}
                    <div className="w-20 shrink-0">
                      <select
                        value={c.creditHours}
                        onChange={(e) => updateSandboxCourse(c.id, "creditHours", Number(e.target.value))}
                        className="w-full bg-card border border-border rounded-lg text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium text-foreground cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5].map((credit) => (
                          <option key={credit} value={credit}>
                            {credit} {credit === 1 ? "Cr" : "Crs"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grade select */}
                    <div className="w-24 shrink-0">
                      <select
                        value={c.grade}
                        onChange={(e) => updateSandboxCourse(c.id, "grade", e.target.value)}
                        className="w-full bg-card border border-border rounded-lg text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary font-bold text-foreground cursor-pointer"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>
                            {g} ({GRADE_POINTS[g].toFixed(1)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delete row */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeSandboxCourse(c.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add Course button */}
              <div className="mt-6 flex gap-3">
                <Button 
                  onClick={addSandboxCourse}
                  variant="outline"
                  className="w-full rounded-lg border border-dashed border-border hover:bg-muted/40 h-10 text-xs font-semibold gap-1.5 transition-all hover:border-primary/50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Course
                </Button>
                
                
              </div>
            </Card>
          </div>

        </section>

        {/* Problem Statement Section */}
        <section id="problems" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <Badge className="bg-destructive/10 text-destructive border-destructive/20 px-3.5 py-1 text-xs font-semibold rounded-full">
              ⚠️ The Friction
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Why spreadsheet templates feel overwhelming
            </h2>
            <p className="text-muted-foreground text-sm">
              We've all tried designing the perfect academic tracker in Excel. Here is exactly where the formula breaks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <Card className="card-premium flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Complex Weights</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Juggling labs with 1.5 credits alongside 3.0 credit core courses, sessional weights, and practical marks quickly results in calculation clutter.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                Math gets messy
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="card-premium flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Razor-Thin Margins</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Missing a vital scholarship CGPA threshold like 3.50 by a mere 0.01 margin can cause stress. Spreadsheets lack error-handling fail-safes.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                High stakes
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="card-premium flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Inconsistent Scales</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Converting raw percentages to standard 4.0, 4.33, or 10.0 grade point scales across departments is frustrating without preconfigured mappings.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                Scales shift
              </div>
            </Card>

            {/* Card 4 */}
            <Card className="card-premium flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Zero Forward Planning</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Static spreadsheets tell you where you are, but never outline exactly what target grades you need in pending exams to save your semester.
                </p>
              </div>
              <div className="pt-4 text-[11px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                Lacks predictions
              </div>
            </Card>

          </div>
        </section>

        {/* Feature Highlights with Stagger animations */}
        <section id="features" className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-3.5 py-1 text-xs font-semibold rounded-full">
              ✨ The Engine
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Clinical features for absolute control
            </h2>
            <p className="text-muted-foreground text-sm">
              We built specialized algorithms to simplify calculations, simulate futures, and keep you on track.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <AnimatedSection delay={50} className="card-premium p-6 space-y-4 hover:border-primary/40">
              <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                <Settings2 className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Custom Formula Settings</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fine-tune sessional weight distributions, include labs, and customize grade boundary percentages to replicate your university's specific handbook guidelines.
              </p>
            </AnimatedSection>

            {/* Feature 2 */}
            <AnimatedSection delay={100} className="card-premium p-6 space-y-4 hover:border-primary/40">
              <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">AI Target Predictions</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide your target CGPA, and our analyzer calculates precisely what raw percentages or grades are required in remaining courses to secure it.
              </p>
            </AnimatedSection>

            {/* Feature 3 */}
            <AnimatedSection delay={150} className="card-premium p-6 space-y-4 hover:border-primary/40">
              <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                <LineChart className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Visual Trajectory Charts</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analyze semester-over-semester progress. Identify which subject buckets are dragging down your grade point averages and visualize your recovery.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Card Section */}
        <section>
          <Card className="rounded-xl border border-border bg-card micro-shadow p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-6 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Ready to take control of your academic trajectory?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                Enter details in your dashboard, configure formulas, and predict outcomes. Start immediately as a guest.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button 
                  onClick={handleStartCalculating} 
                  className="btn-premium-primary text-sm py-5 px-6 rounded-lg"
                >
                  Enter Dashboard (No Sign In)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  asChild
                  variant="outline" 
                  className="btn-premium-secondary text-sm py-5 rounded-lg"
                >
                  <Link href="/SignUp">Create Free Account</Link>
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12 transition-colors">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-foreground">
              CGPA Calculator
            </span>
          </div>

          <div className="flex items-center gap-8 text-xs text-muted-foreground">
            <Link href="/SignUp" className="hover:text-foreground transition-colors">Sign Up</Link>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">LinkedIn</a>
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CGPA Calculator. Sleek mathematical precision.
          </p>
        </div>
      </footer>
    </div>
  );
}
