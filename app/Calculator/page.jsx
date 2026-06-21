"use client";
import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { FormulaSettingsStep } from "../components/FormulaSettingsStep";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  useCalculator,
  findGradeBoundary,
  getWeightedMarks,
  getLabPercentage,
  normalizeCourse,
} from "../contexts/CalculatorContext";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Trophy,
  Plus,
  Trash2,
  FileCheck,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { useRouter } from "next/navigation";

const Calculator = () => {
  const Router = useRouter();
  const { calculatorData, setCalculatorData, calculateCGPA, formulaSettings } =
    useCalculator();

  const [step, setStep] = useState("calculationType");
  const [calculationType, setCalculationType] = useState(
    calculatorData.calculationType || "complete",
  );
  const [courseCount, setCourseCount] = useState("");
  const [courses, setCourses] = useState(
    calculatorData.courses.length > 0 ? calculatorData.courses : [],
  );
  const [cgpa, setCgpa] = useState(calculatorData.cgpa);
  const [isPredicting, setIsPredicting] = useState(false);
  const hasRestoredRef = React.useRef(false);

  React.useEffect(() => {
    if (
      !hasRestoredRef.current &&
      calculatorData.courses.length > 0 &&
      calculatorData.cgpa != null
    ) {
      setCourses(calculatorData.courses.map((course) => normalizeCourse(course)));
      setCgpa(calculatorData.cgpa);
      setCalculationType(calculatorData.calculationType || "complete");
      setStep("results");
      hasRestoredRef.current = true;
    }
  }, [calculatorData]);

  const handleCalculationTypeSubmit = () => {
    setStep("formulaSettings");
  };

  const handleFormulaSettingsContinue = () => {
    setStep("courseCount");
  };

  const handleCourseCountSubmit = () => {
    const count = parseInt(courseCount);
    if (isNaN(count) || count < 1 || count > 20) {
      toast.error("Please enter a valid number between 1 and 20");
      return;
    }

    const newCourses = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      name: "",
      creditHours: 3,
      hasLab: false,
      labMarks: 0,
      sessionalsMarks: 0,
      finalsMarks: 0,
    }));

    setCourses(newCourses);
    setStep("courseDetails");
  };

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: value,
      ...(field === "hasLab" && !value ? { labMarks: 0 } : {}),
    };
    setCourses(updatedCourses);
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: `${Date.now()}`,
      name: "",
      creditHours: 3,
      hasLab: false,
      labMarks: 0,
      sessionalsMarks: 0,
      finalsMarks: 0,
    };
    setCourses([...courses, newCourse]);
  };

  const handleRemoveCourse = (index) => {
    if (courses.length <= 1) {
      toast.error("You must have at least one course");
      return;
    }
    const updatedCourses = courses.filter((_, i) => i !== index);
    setCourses(updatedCourses);
  };

    const handleCalculate = () => {
      const normalizedCourses = courses.map((course) => normalizeCourse(course));

      // If sessionals-only mode, replace finalsMarks with AI estimates if available
      const usingEstimates = calculationType === "sessionals" && calculatorData.aiEstimates;
      if (usingEstimates) {
        normalizedCourses.forEach((c) => {
          const estimate = calculatorData.aiEstimates[c.id];
          if (estimate !== undefined) {
            c.finalsMarks = estimate;
          }
        });
      }

      for (let i = 0; i < normalizedCourses.length; i++) {
        const course = normalizedCourses[i];
        if (!course.name.trim()) {
          toast.error(`Please enter name for course ${i + 1}`);
          return;
        }
        if (course.creditHours < 1 || course.creditHours > 6) {
          toast.error(`Credit hours for ${course.name} must be between 1 and 6`);
          return;
        }
        if (course.sessionalsMarks < 0 || course.sessionalsMarks > 100) {
          toast.error(
            `Sessionals marks for ${course.name} must be between 0 and 100`,
          );
          return;
        }
        if (
          calculationType === "complete" &&
          (course.finalsMarks < 0 || course.finalsMarks > 100)
        ) {
          toast.error(
            `Finals marks for ${course.name} must be between 0 and 100`,
          );
          return;
        }
        if (
          course.hasLab &&
          (course.labMarks < 0 || course.labMarks > formulaSettings.labMaxMarks)
        ) {
          toast.error(
            `Lab marks for ${course.name} must be between 0 and ${formulaSettings.labMaxMarks}`,
          );
          return;
        }
      }

      const calculatedCgpa = calculateCGPA(
        normalizedCourses,
        calculationType,
        formulaSettings,
      );
      setCourses(normalizedCourses);
      setCgpa(calculatedCgpa);
      setCalculatorData({
        courses: normalizedCourses,
        cgpa: calculatedCgpa,
        calculationType,
      });
      setStep("results");
      toast.success("CGPA calculated successfully!");
    };

  const handleRecalculate = () => {
    setCourseCount("");
    setCourses([]);
    setCgpa(null);
    setStep("calculationType");
    setCalculatorData({ courses: [], cgpa: null, calculationType: "complete" });
  };

  const handlePredictFinals = async () => {
    const prompt = `You are an AI Academic Advisor. Estimate the final marks (out of ${formulaSettings.finalsWeight}) for these courses based on their sessional marks.
Settings: Sessional Weight = ${formulaSettings.sessionalsWeight}%, Final Weight = ${formulaSettings.finalsWeight}%.
Courses:
${courses.map(c => `- ${c.name}: Sessional Marks = ${c.sessionalsMarks} (out of ${formulaSettings.sessionalsWeight})`).join("\n")}

Respond ONLY with a JSON object in this exact format:
{
  "estimates": [
    { "courseId": "replace_with_course_id", "estimatedFinals": 56, "reason": "based on sessional score" }
  ]
}
Return ONLY the raw JSON block without markdown formatting or other characters. Ensure the courseId matches the ones listed below:
${courses.map(c => `id "${c.id}" for course "${c.name}"`).join(", ")}
`;

    try {
      setIsPredicting(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const text = data.reply || "";
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = text.substring(jsonStart, jsonEnd);
        const parsed = JSON.parse(jsonStr);
        if (parsed && parsed.estimates) {
          const estimatesObj = {};
          parsed.estimates.forEach(est => {
            estimatesObj[est.courseId] = Number(est.estimatedFinals) || 0;
          });
          
          setCalculatorData({
            ...calculatorData,
            aiEstimates: estimatesObj
          });
          toast.success("AI Finals Marks estimated successfully!");
        } else {
          throw new Error("Invalid format returned by AI");
        }
      } else {
        throw new Error("AI did not return a valid JSON block");
      }
    } catch (err) {
      console.error(err);
      // Fallback: estimate finals marks proportionally based on sessionals
      const estimatesObj = {};
      courses.forEach(c => {
        const sessionalPct = formulaSettings.sessionalsWeight > 0 ? (c.sessionalsMarks / formulaSettings.sessionalsWeight) : 0;
        estimatesObj[c.id] = Math.round(sessionalPct * formulaSettings.finalsWeight);
      });
      setCalculatorData({
        ...calculatorData,
        aiEstimates: estimatesObj
      });
      toast.info("Generated proportional finals estimates (AI endpoint busy).");
    } finally {
      setIsPredicting(false);
    }
  };

  const getCourseGrade = (course) => {
    const normalized = normalizeCourse(course);
    const weightedMarks = getWeightedMarks(
      normalized,
      calculationType,
      formulaSettings,
    );
    const theoryGrade = findGradeBoundary(
      weightedMarks,
      formulaSettings.gradeBoundaries,
    );

    let lab = null;
    if (normalized.hasLab) {
      const labPercentage = getLabPercentage(
        normalized.labMarks,
        formulaSettings.labMaxMarks,
      );
      const labGrade = findGradeBoundary(
        labPercentage,
        formulaSettings.gradeBoundaries,
      );
      lab = {
        grade: labGrade?.grade || "N/A",
        gpa: labGrade?.gpa ?? 0,
        marks: normalized.labMarks,
        percentage: labPercentage,
      };
    }

    return {
      grade: theoryGrade?.grade || "N/A",
      gpa: theoryGrade?.gpa ?? 0,
      percentage: weightedMarks,
      lab,
    };
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Calculation Type */}
          {step === "calculationType" && (
            <Card className="rounded-xl border border-border bg-card micro-shadow">
              <CardHeader className="text-center pb-6 border-b border-border">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-lg w-fit mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">
                  Select Calculation Type
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Choose the type of CGPA calculation you want to perform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Sessionals Only */}
                <Card
                  className={`cursor-pointer transition-all duration-200 border rounded-xl p-4 ${
                    calculationType === "sessionals"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/20"
                  }`}
                  onClick={() => setCalculationType("sessionals")}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        calculationType === "sessionals"
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold text-foreground">
                        Sessionals Only
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Calculate CGPA based on sessionals marks only
                      </CardDescription>
                    </div>
                    {calculationType === "sessionals" && (
                      <Badge className="bg-primary text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</Badge>
                    )}
                  </div>
                </Card>

                {/* Complete Calculation */}
                <Card
                  className={`cursor-pointer transition-all duration-200 border rounded-xl p-4 ${
                    calculationType === "complete"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-muted/20"
                  }`}
                  onClick={() => setCalculationType("complete")}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2.5 rounded-lg shrink-0 ${
                        calculationType === "complete"
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-bold text-foreground">Complete CGPA</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Calculate CGPA using both sessionals and finals marks
                      </CardDescription>
                    </div>
                    {calculationType === "complete" && (
                      <Badge className="bg-primary text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded-full">Selected</Badge>
                    )}
                  </div>
                </Card>

                <Button
                  onClick={handleCalculationTypeSubmit}
                  className="btn-premium-primary w-full text-sm h-11 mt-4"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Formula Settings */}
          {step === "formulaSettings" && (
            <FormulaSettingsStep
              onBack={() => setStep("calculationType")}
              onContinue={handleFormulaSettingsContinue}
            />
          )}

          {/* Step 3: Course Count */}
          {step === "courseCount" && (
            <Card className="rounded-xl border border-border bg-card micro-shadow">
              <CardHeader className="text-center pb-6 border-b border-border">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-lg w-fit mb-4">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-2xl font-extrabold tracking-tight">How many courses?</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  Enter the number of courses you want to calculate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 text-xs text-muted-foreground font-medium">
                  Using formula: <span className="text-foreground">{formulaSettings.sessionalsWeight}% sessionals</span>
                  {calculationType === "complete" &&
                    ` + ${formulaSettings.finalsWeight}% finals`}
                  {" · "}Lab = {formulaSettings.labCreditHours} cr, /{formulaSettings.labMaxMarks} marks
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Number of Courses</Label>
                  <Input
                    id="courseCount"
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g., 5"
                    value={courseCount}
                    onChange={(e) => setCourseCount(e.target.value)}
                    className="text-center text-2xl h-14 font-extrabold tracking-tight border-border focus-visible:ring-primary rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep("formulaSettings")}
                    size="lg"
                    className="flex-1 btn-premium-secondary text-sm h-11"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleCourseCountSubmit}
                    className="flex-1 btn-premium-primary text-sm h-11"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Course Details */}
          {step === "courseDetails" && (
            <Card className="rounded-xl border border-border bg-card micro-shadow">
              <CardHeader className="pb-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-extrabold tracking-tight">
                      Enter Course Details
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Fill in information for each course
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setStep("courseCount")}
                    size="sm"
                    className="rounded-lg h-9 text-xs font-semibold border-border hover:bg-muted/40 transition-all text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                    Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {courses.map((course, index) => (
                  <Card key={course.id} className="border border-border bg-card rounded-xl overflow-hidden shadow-none">
                    <CardHeader className="pb-3 bg-muted/20 border-b border-border/60">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold text-foreground">
                          Course {index + 1}
                        </CardTitle>
                        {courses.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCourse(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 px-2.5 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            <span className="text-xs font-semibold">Remove</span>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor={`name-${index}`} className="text-xs font-semibold">Course Name</Label>
                          <Input
                            id={`name-${index}`}
                            placeholder="e.g., Data Structures"
                            value={course.name}
                            onChange={(e) =>
                              handleCourseChange(index, "name", e.target.value)
                            }
                            className="border-border rounded-lg text-sm h-10"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/10">
                            <input
                              id={`lab-${index}`}
                              type="checkbox"
                              checked={course.hasLab}
                              onChange={(e) =>
                                handleCourseChange(
                                  index,
                                  "hasLab",
                                  e.target.checked,
                                )
                              }
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <Label
                              htmlFor={`lab-${index}`}
                              className="cursor-pointer font-semibold text-xs text-foreground"
                            >
                              Includes lab (+{formulaSettings.labCreditHours} credit hour
                              {formulaSettings.labCreditHours !== 1 ? "s" : ""})
                            </Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`credit-${index}`} className="text-xs font-semibold">Credit Hours</Label>
                          <Input
                            id={`credit-${index}`}
                            type="number"
                            min="1"
                            max="6"
                            value={course.creditHours}
                            onChange={(e) =>
                              handleCourseChange(
                                index,
                                "creditHours",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="border-border rounded-lg text-sm h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`sessionals-${index}`} className="text-xs font-semibold">Sessionals Marks</Label>
                          <Input
                            id={`sessionals-${index}`}
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0-100"
                            value={course.sessionalsMarks}
                            onChange={(e) =>
                              handleCourseChange(
                                index,
                                "sessionalsMarks",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="border-border rounded-lg text-sm h-10"
                          />
                        </div>
                        {/* Only show Finals field if calculation type is complete */}
                        {calculationType === "complete" && (
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`finals-${index}`} className="text-xs font-semibold">Finals Marks</Label>
                            <Input
                              id={`finals-${index}`}
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0-100"
                              value={course.finalsMarks}
                              onChange={(e) =>
                                handleCourseChange(
                                  index,
                                  "finalsMarks",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="border-border rounded-lg text-sm h-10"
                            />
                          </div>
                        )}
                        {course.hasLab && (
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`lab-marks-${index}`} className="text-xs font-semibold">
                              Lab Marks (out of {formulaSettings.labMaxMarks})
                            </Label>
                            <Input
                              id={`lab-marks-${index}`}
                              type="number"
                              min="0"
                              max={formulaSettings.labMaxMarks}
                              placeholder={`0-${formulaSettings.labMaxMarks}`}
                              value={course.labMarks}
                              onChange={(e) =>
                                handleCourseChange(
                                  index,
                                  "labMarks",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="border-border rounded-lg text-sm h-10"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={handleAddCourse}
                  className="w-full border-dashed border-2 border-border hover:border-primary/50 hover:bg-muted/20 h-11 text-xs font-bold rounded-lg transition-all"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Course
                </Button>

                <Button
                  onClick={handleCalculate}
                  className="w-full btn-premium-primary text-sm h-12"
                  size="lg"
                >
                  Calculate CGPA
                  <Trophy className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Results */}
          {step === "results" && cgpa != null && (
            <div className="space-y-6">
              {/* CGPA Card */}
              <Card className="border border-primary/20 bg-primary/5 text-foreground rounded-xl p-8 text-center">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-lg w-fit mb-4">
                  <Trophy className="h-7 w-7" />
                </div>
                <CardTitle className="text-2xl font-extrabold text-foreground">
                  Your Calculated CGPA
                </CardTitle>
                <div className="text-6xl font-black text-primary my-4 tracking-tight">
                  {cgpa.toFixed(2)}
                </div>
                <CardDescription className="text-muted-foreground text-sm">
                  Based on {courses.length} courses
                </CardDescription>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 rounded-full font-semibold">
                    {calculationType === "sessionals"
                      ? "Sessionals Only"
                      : "Complete Calculation"}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 rounded-full font-semibold">
                    {formulaSettings.sessionalsWeight}/
                    {formulaSettings.finalsWeight} weightage
                  </Badge>
                </div>
              </Card>

              {calculationType === "sessionals" && (
                <Card className="rounded-xl border border-border bg-card micro-shadow">
                  <CardContent className="py-5 px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="font-bold text-base flex items-center gap-2 justify-center sm:justify-start text-foreground">
                          <Sparkles className="h-4.5 w-4.5 text-primary" />
                          AI Final Exam Estimates
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Predict final exam marks for all courses based on your sessional scores.
                        </p>
                      </div>
                      <Button
                        onClick={handlePredictFinals}
                        disabled={isPredicting}
                        className="btn-premium-primary text-xs h-9 rounded-lg shrink-0 shadow-none px-4"
                      >
                        {isPredicting ? (
                          <>
                            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                            Estimating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-3.5 w-3.5" />
                            {calculatorData.aiEstimates ? "Regenerate Predictions" : "Predict Finals Marks"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Breakdown */}
              <Card className="rounded-xl border border-border bg-card micro-shadow">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="text-lg font-bold text-foreground">Course Breakdown</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Individual grades and performance for each course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {courses.map((course, index) => {
                    const { grade, gpa: courseGpa, percentage, lab } = getCourseGrade(course);
                    return (
                      <Card key={course.id} className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-base text-foreground">
                                {course.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {course.creditHours} Credit Hour
                                {course.creditHours !== 1 ? "s" : ""}
                                {course.hasLab && (
                                  <>
                                    {" + "}
                                    {formulaSettings.labCreditHours} Lab Credit Hour
                                    {formulaSettings.labCreditHours !== 1 ? "s" : ""}
                                    <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground border-0 text-[10px] py-0 px-2 font-bold">
                                      Lab
                                    </Badge>
                                  </>
                                )}
                              </p>
                            </div>
                            <Badge
                              className={`text-sm px-2.5 py-0.5 rounded-full font-bold border-0 ${
                                courseGpa >= 3.5
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : courseGpa >= 2.5
                                    ? "bg-primary/10 text-primary"
                                    : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {grade} (GPA: {courseGpa.toFixed(2)})
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                                Sessionals
                              </p>
                              <p className="font-bold text-foreground mt-0.5">
                                {course.sessionalsMarks}
                                {course.sessionalsMarks <= formulaSettings.sessionalsWeight && formulaSettings.sessionalsWeight > 0 ? (
                                  <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                                    ({((course.sessionalsMarks / formulaSettings.sessionalsWeight) * 100).toFixed(0)}%)
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                                    ({course.sessionalsMarks}%)
                                  </span>
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Finals</p>
                              <p className="font-bold text-foreground mt-0.5">
                                {calculationType === "sessionals" ? (
                                  calculatorData.aiEstimates && calculatorData.aiEstimates[course.id] != null ? (
                                    <span className="text-primary font-bold">
                                      {calculatorData.aiEstimates[course.id]} (Est.)
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground italic text-xs font-normal">Pending</span>
                                  )
                                ) : (
                                  course.finalsMarks
                                )}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Theory GPA</p>
                              <p className="font-bold text-foreground mt-0.5">{courseGpa.toFixed(2)}</p>
                            </div>
                          </div>
                          {lab && (
                            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div>
                                <p className="text-muted-foreground">Lab Marks</p>
                                <p className="font-semibold text-foreground">
                                  {lab.marks}/{formulaSettings.labMaxMarks}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lab %</p>
                                <p className="font-semibold text-foreground">{lab.percentage.toFixed(2)}%</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lab Grade</p>
                                <p className="font-semibold text-foreground">{lab.grade}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Lab GPA</p>
                                <p className="font-semibold text-foreground">{lab.gpa.toFixed(2)}</p>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Overall Percentage
                              </span>
                              <span className="font-bold text-foreground">
                                {percentage.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={handleRecalculate}
                  variant="outline"
                  size="lg"
                  className="w-full btn-premium-secondary text-sm h-11"
                >
                  Calculate Again
                </Button>
                <Button
                  onClick={() => Router.push("/AISuggestions")}
                  className="w-full btn-premium-primary text-sm h-11"
                  size="lg"
                >
                  View AI Suggestions
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
