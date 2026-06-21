"use client";
import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { useCalculator } from "../contexts/CalculatorContext";
import {
  Sparkles,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AISuggestions = () => {
  const { calculatorData, formulaSettings } = useCalculator();
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const parseMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4
            key={idx}
            className="text-base font-bold text-foreground mt-4 mb-2"
          >
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3
            key={idx}
            className="text-lg font-bold text-foreground mt-5 mb-3 border-b pb-1"
          >
            {line.replace("## ", "")}
          </h3>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h2 key={idx} className="text-xl font-bold text-foreground mt-6 mb-4">
            {line.replace("# ", "")}
          </h2>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li
            key={idx}
            className="list-disc ml-5 text-sm text-muted-foreground leading-relaxed my-1"
          >
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="text-sm text-muted-foreground leading-relaxed my-1.5"
        >
          {line}
        </p>
      );
    });
  };

  useEffect(() => {
    if (!calculatorData.cgpa || calculatorData.courses.length === 0) return;

    const fetchSuggestions = async () => {
      setIsLoading(true);
      const prompt = `You are an expert Academic Performance Consultant. Your task is to analyze the raw student data provided below and deliver a fiercely personalized, hyper-targeted study intervention strategy. 

[CRITICAL INSTRUCTION]
Do not give a generic response or one-size-fits-all student advice. You must dynamically adapt your tone, harshness/praise, and tactical advice based entirely on the student's current CGPA and sessional trajectory.

[RAW STUDENT DATA]
- Current CGPA: ${calculatorData.cgpa.toFixed(2)}
- Calculation Mode: ${calculatorData.calculationType}
- Grading Scale Weights: Sessional = ${formulaSettings.sessionalsWeight}%, Final = ${formulaSettings.finalsWeight}%
- Course Breakdown:
${calculatorData.courses.map((c) => `- ${c.name} (${c.creditHours} Cr): Sessional = ${c.sessionalsMarks}/${formulaSettings.sessionalsWeight}${c.calculationType !== "sessionals" ? `, Final = ${c.finalsMarks}/${formulaSettings.finalsWeight}` : ""}${c.hasLab ? `, Lab = ${c.labMarks}/${formulaSettings.labMaxMarks}` : ""}`).join("\n")}

[STEP 1: TIER CLASSIFICATION]
First, internally evaluate which tier the student belongs to based on their data. You must adopt the exact Persona and Strategy Constraints assigned to that tier:

* Tier A: High Achievers (CGPA >= 3.5)
  - Persona: Elite coach, analytical, optimization-focused. Do not waste time explaining basic study habits. 
  - Strategy: Focus entirely on marginal gains, preventing minor slip-ups, stress/burnout management, and maintaining an elite GPA.
* Tier B: Average/Inconsistent (CGPA 2.5 - 3.49)
  - Persona: Pragmatic, direct, tactical mentor. 
  - Strategy: Identify the specific "anchor" course dragging the average down. Focus heavily on turning C/D grades into Bs. Optimize final exam target scores to hit exactly a 3.5+.
* Tier C: Critical Risk (CGPA < 2.5 OR Sessional Marks < 50% in multiple courses)
  - Persona: Direct, urgent, no-nonsense triage counselor. Cut through excuses.
  - Strategy: Emergency academic triage. Ignore optimization; focus purely on survival, passing thresholds, and avoiding course failure or academic probation.

[STEP 2: REQUIRED OUTPUT FORMAT]
Provide your analysis using the following exact headers. Keep the entire response under 250 words total—make every sentence cut deep.

### 1. Hard Truth Diagnosis
- Provide a brutal, data-driven assessment of exactly where they stand today. Call out their exact performance tier implicitly through your tone. No generic pleasantries.

### 2. High-Leverage Exam Targets
${
  calculatorData.calculationType === "sessionals"
    ? "- Explicitly state the exact minimum scores required on the upcoming final exams to hit their next logical milestone (e.g., passing vs. hitting a 3.7). Format: `[Course Name]: Need X/${formulaSettings.finalsWeight} to secure [Target Grade]`"
    : "- State the precise mathematical deficit they must overcome next semester to move up a tier."
}

### 3. Hyper-Targeted Tactical Interventions
- Pick the absolute highest-stakes course for this student.
- Give 2 hyper-specific execution steps tailored to their tier. (Tier A = advanced retrieval practice/indexing; Tier B = targeted question-type mastery; Tier C = grade-salvage triage, office hours, and rote question-pattern memorization).

### 4. Behavioral Pivot
- Give exactly 1 psychological or scheduling shift required *specifically* for a student at their exact GPA level to avoid stalling out or crashing.`;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt }),
        });
        const data = await res.json();
        console.log(data);
        if (data.error) throw new Error(data.error);
        setAiSuggestions(data.reply || "No suggestions available.");
      } catch (err) {
        console.error(err);
        setAiSuggestions(`### Study Advice Fallback (AI endpoint busy)
        
- **Sessionals focus**: Continue tracking sessional scores out of 100.
- **Goal planning**: For courses with sessional percentages under 75%, prioritize review of midterm material before finals.
- **Formulas**: Your current sessionals weight is ${formulaSettings.sessionalsWeight}%. Make sure to verify grade boundaries in Settings.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [calculatorData, formulaSettings]);

  if (!calculatorData.cgpa || calculatorData.courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-md text-center py-12">
              <CardContent>
                <div className="mx-auto bg-gradient-to-br from-pink-600 to-purple-600 p-4 rounded-xl w-fit mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-4">
                  No Data Available
                </CardTitle>
                <CardDescription className="text-base mb-6">
                  Please calculate your CGPA first to get AI-powered suggestions
                </CardDescription>
                <Button
                  onClick={() => router.push("/Calculator")}
                  className="bg-linear-to-r from-blue-300 to-blue-900 hover:from-blue-900 hover:to-blue-400"
                >
                  Calculate CGPA
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Analyze courses
  const analyzedCourses = calculatorData.courses.map((course) => {
    const weightedMarks = course.sessionalsMarks + course.finalsMarks;

    const grade = formulaSettings.gradeBoundaries.find(
      (gb) =>
        weightedMarks >= gb.minPercentage && weightedMarks <= gb.maxPercentage,
    );

    return {
      ...course,
      weightedMarks,
      grade: grade?.grade || "F",
      gpa: grade?.gpa || 0,
      status:
        grade && grade.gpa >= 3.5
          ? "excellent"
          : grade && grade.gpa >= 2.5
            ? "average"
            : "weak",
    };
  });

  const weakCourses = analyzedCourses.filter((c) => c.status === "weak");
  const averageCourses = analyzedCourses.filter((c) => c.status === "average");
  const excellentCourses = analyzedCourses.filter(
    (c) => c.status === "excellent",
  );

  const overallStatus =
    calculatorData.cgpa >= 3.5
      ? "excellent"
      : calculatorData.cgpa >= 2.5
        ? "good"
        : "needs-improvement";

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "bg-green-500";
      case "average":
        return "bg-yellow-500";
      case "weak":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "excellent":
        return "default";
      case "average":
        return "secondary";
      case "weak":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              AI Suggestions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personalized insights to improve your academic performance
            </p>
          </div>

          {/* Overall Performance */}
          <Card className="border border-primary/25 bg-primary/5 text-foreground rounded-xl p-6">
            <CardHeader className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-foreground text-lg font-bold">
                  Overall Performance
                </CardTitle>
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="text-5xl font-black tracking-tight text-primary">
                  {calculatorData.cgpa.toFixed(2)}
                </div>
                <div className="space-y-1">
                  <Badge
                    className={`border-0 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      overallStatus === "excellent"
                        ? "bg-green-600"
                        : overallStatus === "good"
                          ? "bg-yellow-600"
                          : "bg-destructive"
                    }`}
                  >
                    {overallStatus === "excellent"
                      ? "Excellent"
                      : overallStatus === "good"
                        ? "Good"
                        : "Needs Improvement"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    {excellentCourses.length} excellent •{" "}
                    {averageCourses.length} average • {weakCourses.length} weak
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* AI Advisor Suggestions Card */}
          <Card className="rounded-xl border border-border bg-card micro-shadow border-l-4 border-l-primary relative overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                <CardTitle className="text-base font-bold text-foreground">
                  AI Counselor Study Plan
                </CardTitle>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Real-time personalized suggestions powered by Google Gemini
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Consulting AI advisor...
                  </span>
                </div>
              ) : (
                <div className="space-y-1 prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {aiSuggestions}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Breakdown */}
          {calculatorData.calculationType != "sessionals" && (
            <Card className="rounded-xl border border-border bg-card micro-shadow">
              <CardHeader className="pb-4 border-b border-border">
                <CardTitle className="text-base font-bold text-foreground">
                  Performance Distribution
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  Overview of your grades across all courses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        Excellent (GPA ≥ 3.5)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {excellentCourses.length} courses
                      </span>
                    </div>
                    <Progress
                      value={
                        (excellentCourses.length /
                          calculatorData.courses.length) *
                        100
                      }
                      className="h-2 bg-muted rounded-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        Average (2.5 ≤ GPA &lt; 3.5)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {averageCourses.length} courses
                      </span>
                    </div>
                    <Progress
                      value={
                        (averageCourses.length /
                          calculatorData.courses.length) *
                        100
                      }
                      className="h-2 bg-muted rounded-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-semibold flex items-center gap-2 text-foreground">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        Weak (GPA &lt; 2.5)
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {weakCourses.length} courses
                      </span>
                    </div>
                    <Progress
                      value={
                        (weakCourses.length / calculatorData.courses.length) *
                        100
                      }
                      className="h-2 bg-muted rounded-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Weak Courses - Priority Focus */}
          {calculatorData.calculationType != "sessionals" && (
            <Card className="rounded-xl border border-border bg-card micro-shadow border-l-4 border-l-destructive">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-2 rounded-lg text-destructive">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Courses Needing Attention
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Focus on these courses to improve your overall CGPA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {weakCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="border border-destructive/20 bg-destructive/5 rounded-xl shadow-none"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-base text-foreground">
                            {course.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {course.creditHours} Credit Hours
                          </p>
                        </div>
                        <Badge className="bg-destructive text-white border-0 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Grade: {course.grade}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                          <p className="text-muted-foreground">Sessionals</p>
                          <p className="font-bold text-foreground mt-0.5">
                            {course.sessionalsMarks}
                            {course.sessionalsMarks <=
                              formulaSettings.sessionalsWeight &&
                            formulaSettings.sessionalsWeight > 0 ? (
                              <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                                (
                                {(
                                  (course.sessionalsMarks /
                                    formulaSettings.sessionalsWeight) *
                                  100
                                ).toFixed(0)}
                                %)
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                                ({course.sessionalsMarks}%)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="bg-muted/40 p-2.5 rounded-lg border border-border/50">
                          <p className="text-muted-foreground">Finals</p>
                          <p className="font-bold text-foreground mt-0.5">
                            {calculatorData.calculationType === "sessionals" ? (
                              calculatorData.aiEstimates &&
                              calculatorData.aiEstimates[course.id] != null ? (
                                <span className="text-primary font-bold">
                                  {calculatorData.aiEstimates[course.id]} (Est.)
                                </span>
                              ) : (
                                <span className="text-muted-foreground italic text-[11px] font-normal">
                                  Pending
                                </span>
                              )
                            ) : (
                              `${course.finalsMarks}/100`
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-3 rounded-lg border border-border/80">
                        <div className="flex items-start gap-2 text-xs">
                          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <p className="text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">
                              Suggestion:
                            </strong>{" "}
                            This course needs immediate attention. Consider
                            spending more study time, attending extra help
                            sessions, or forming study groups to improve your
                            understanding of the material.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Average Courses */}
          {averageCourses.length > 0 && (
            <Card className="rounded-xl border border-border bg-card micro-shadow border-l-4 border-l-yellow-500">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-600">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Room for Improvement
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      These courses have potential for higher grades
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {averageCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="border border-border bg-card rounded-xl shadow-none overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-foreground">
                            {course.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Sessionals: {course.sessionalsMarks}
                            {course.sessionalsMarks <=
                              formulaSettings.sessionalsWeight &&
                            formulaSettings.sessionalsWeight > 0
                              ? ` (${((course.sessionalsMarks / formulaSettings.sessionalsWeight) * 100).toFixed(0)}%)`
                              : ` (${course.sessionalsMarks}%)`}{" "}
                            | Finals:{" "}
                            {calculatorData.calculationType === "sessionals"
                              ? calculatorData.aiEstimates &&
                                calculatorData.aiEstimates[course.id] != null
                                ? `${calculatorData.aiEstimates[course.id]} (Est.)`
                                : "Pending"
                              : course.finalsMarks}
                          </p>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Grade: {course.grade}
                        </Badge>
                      </div>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium mt-3">
                        With a bit more effort, you can push this to an
                        excellent grade!
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Excellent Courses */}
          {excellentCourses.length > 0 && (
            <Card className="rounded-xl border border-border bg-card micro-shadow border-l-4 border-l-green-500">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg text-green-600">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      Excellent Performance
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Keep up the great work in these courses!
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {excellentCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="border border-border bg-card rounded-xl shadow-none overflow-hidden"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-sm text-foreground">
                            {course.name}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            Grade: {course.grade}
                          </Badge>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                          Outstanding work! Maintain this level of performance.
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* General Tips */}
          <Card className="rounded-xl border border-border bg-card micro-shadow">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Lightbulb className="h-5 w-5 text-primary" />
                General Study Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>
                    Create a consistent study schedule and stick to it
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>
                    Prioritize courses with lower grades for immediate
                    improvement
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>
                    Use active learning techniques like practice problems and
                    teaching others
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>
                    Don't hesitate to seek help from professors or tutors when
                    needed
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <span>
                    Balance your workload across all courses to prevent burnout
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={() => router.push("/Calculator")}
              className="btn-premium-primary text-sm h-11 px-8"
              size="lg"
            >
              Recalculate CGPA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISuggestions;
