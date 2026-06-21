"use client"
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useCalculator, validateFormulaSettings } from '../contexts/CalculatorContext';
import { Settings, Save, Plus, Trash2, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../components/ui/badge';
import {useRouter} from "next/navigation"

const formulaPresets = [
  {
    name: "Default",
    settings: {
      sessionalsWeight: 30,
      finalsWeight: 70,
      labCreditHours: 1,
      labMaxMarks: 50,
      gradeBoundaries: [
        { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
        { grade: 'A', minPercentage: 85, maxPercentage: 89, gpa: 3.7 },
        { grade: 'B+', minPercentage: 80, maxPercentage: 84, gpa: 3.3 },
        { grade: 'B', minPercentage: 75, maxPercentage: 79, gpa: 3.0 },
        { grade: 'C+', minPercentage: 70, maxPercentage: 74, gpa: 2.7 },
        { grade: 'C', minPercentage: 65, maxPercentage: 69, gpa: 2.3 },
        { grade: 'D', minPercentage: 60, maxPercentage: 64, gpa: 2.0 },
        { grade: 'F', minPercentage: 0, maxPercentage: 59, gpa: 0.0 },
      ],
    },
  },
  {
    name: "NED University",
    settings: {
      sessionalsWeight: 40,
      finalsWeight: 60,
      labCreditHours: 1,
      labMaxMarks: 50,
      gradeBoundaries: [
        { grade: 'A+', minPercentage: 94, maxPercentage: 100, gpa: 4.0 },
        { grade: 'A', minPercentage: 85, maxPercentage: 93, gpa: 4.0 },
        { grade: 'A-', minPercentage: 80, maxPercentage: 84, gpa: 3.7 },
        { grade: 'B+', minPercentage: 75, maxPercentage: 79, gpa: 3.4 },
        { grade: 'B', minPercentage: 70, maxPercentage: 74, gpa: 3.0 },
        { grade: 'B-', minPercentage: 67, maxPercentage: 69, gpa: 2.7 },
        { grade: 'C+', minPercentage: 64, maxPercentage: 66, gpa: 2.4 },
        { grade: 'C', minPercentage: 60, maxPercentage: 63, gpa: 2.0 },
        { grade: 'C-', minPercentage: 57, maxPercentage: 59, gpa: 1.7 },
        { grade: 'D+', minPercentage: 54, maxPercentage: 56, gpa: 1.4 },
        { grade: 'D', minPercentage: 50, maxPercentage: 53, gpa: 1.0 },
        { grade: 'F', minPercentage: 0, maxPercentage: 49, gpa: 0.0 },
      ],
    },
  },
];

const FormulaSettings = () => {
  const { formulaSettings, updateFormulaSettings } = useCalculator();
  
  const [sessionalsWeight, setSessionalsWeight] = useState(formulaSettings.sessionalsWeight);
  const [finalsWeight, setFinalsWeight] = useState(formulaSettings.finalsWeight);
  const [labCreditHours, setLabCreditHours] = useState(formulaSettings.labCreditHours ?? 1);
  const [labMaxMarks, setLabMaxMarks] = useState(formulaSettings.labMaxMarks ?? 50);
  const [gradeBoundaries, setGradeBoundaries] = useState(formulaSettings.gradeBoundaries ?? []);
  const [selectedPreset, setSelectedPreset] = useState('Default');
  // Load custom settings from localStorage if they exist
  useEffect(() => {
    const stored = localStorage.getItem('customFormulaSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        updateFormulaSettings(parsed);
        setSessionalsWeight(parsed.sessionalsWeight);
        setFinalsWeight(parsed.finalsWeight);
        setLabCreditHours(parsed.labCreditHours ?? 1);
        setLabMaxMarks(parsed.labMaxMarks ?? 50);
        setGradeBoundaries(parsed.gradeBoundaries ?? []);
        toast.success('Loaded custom formula settings from previous session');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Preset selection handler
  const handlePresetChange = (presetName) => {
    const selected = formulaPresets.find(p => p.name === presetName);
    if (selected) {
      const s = selected.settings;
      setSessionalsWeight(s.sessionalsWeight);
      setFinalsWeight(s.finalsWeight);
      setLabCreditHours(s.labCreditHours);
      setLabMaxMarks(s.labMaxMarks);
      setGradeBoundaries(s.gradeBoundaries);
      setSelectedPreset(presetName);
      updateFormulaSettings(s);
      toast.success(`Preset "${selected.name}" applied`);
    }
  };

  const presetDropdown = (
    <Card className="rounded-xl border border-border bg-card micro-shadow">
      <CardHeader className="pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Formula Preset</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Start from a preset or customise every setting below
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid sm:grid-cols-2 gap-3">
          {formulaPresets.map((p) => {
            const isActive = selectedPreset === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetChange(p.name)}
                className={[
                  'group relative text-left rounded-xl border-2 p-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_12%,transparent)]'
                    : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
                ].join(' ')}
              >
                {/* Active indicator dot */}
                <span
                  className={[
                    'absolute top-3.5 right-3.5 h-2.5 w-2.5 rounded-full transition-all duration-200',
                    isActive ? 'bg-primary scale-100' : 'bg-border scale-75',
                  ].join(' ')}
                />

                <p className={['text-sm font-bold mb-2.5 pr-5 transition-colors', isActive ? 'text-primary' : 'text-foreground group-hover:text-primary/80'].join(' ')}>
                  {p.name}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Sessionals {p.settings.sessionalsWeight}%
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Finals {p.settings.finalsWeight}%
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {p.settings.gradeBoundaries.length} Grades
                  </span>
                </div>

                <div className={['mt-3 flex items-center gap-1 text-[10px] font-bold transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary/70'].join(' ')}>
                  {isActive ? 'Currently active' : 'Apply preset'}
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );


  const handleWeightChange = (type, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (type === 'sessionals') {
      setSessionalsWeight(numValue);
      setFinalsWeight(100 - numValue);
    } else {
      setFinalsWeight(numValue);
      setSessionalsWeight(100 - numValue);
    }
  };

  const handleGradeBoundaryChange = (index, field, value) => {
    const updated = [...gradeBoundaries];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setGradeBoundaries(updated);
  };

  const handleAddGradeBoundary = () => {
    const newBoundary = {
      grade: '',
      minPercentage: 0,
      maxPercentage: 0,
      gpa: 0,
    };
    setGradeBoundaries([...gradeBoundaries, newBoundary]);
  };
const router = useRouter();
  const handleRemoveGradeBoundary = (index) => {
    if (gradeBoundaries.length <= 1) {
      toast.error('You must have at least one grade boundary');
      return;
    }
    const updated = gradeBoundaries.filter((_, i) => i !== index);
    setGradeBoundaries(updated);
  };

  const handleSave = () => {
    const result = validateFormulaSettings({
      sessionalsWeight,
      finalsWeight,
      labCreditHours,
      labMaxMarks,
      gradeBoundaries,
    });

    if (!result.valid) {
      toast.error(result.error);
      return;
    }

    updateFormulaSettings(result.settings);
    toast.success('Formula settings saved successfully!');
    router.push("/Calculator")
  };

  const handleReset = () => {
    setSessionalsWeight(30);
    setFinalsWeight(70);
    setLabCreditHours(1);
    setLabMaxMarks(50);
    setGradeBoundaries([
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
      { grade: 'A', minPercentage: 85, maxPercentage: 89, gpa: 3.7 },
      { grade: 'B+', minPercentage: 80, maxPercentage: 84, gpa: 3.3 },
      { grade: 'B', minPercentage: 75, maxPercentage: 79, gpa: 3.0 },
      { grade: 'C+', minPercentage: 70, maxPercentage: 74, gpa: 2.7 },
      { grade: 'C', minPercentage: 65, maxPercentage: 69, gpa: 2.3 },
      { grade: 'D', minPercentage: 60, maxPercentage: 64, gpa: 2.0 },
      { grade: 'F', minPercentage: 0, maxPercentage: 59, gpa: 0.0 },
    ]);
    toast.success('Reset to default settings');
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />
      
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Formula Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customize how your CGPA is calculated
            </p>
          </div>

          {presetDropdown}
          {/* Weightage Settings */}
          <Card className="rounded-xl border border-border bg-card micro-shadow">

            <CardHeader className="pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Marks Weightage</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Define the percentage weightage for sessionals and finals
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionals" className="text-xs font-semibold">Sessionals Weight (%)</Label>
                  <Input
                    id="sessionals"
                    type="number"
                    min="0"
                    max="100"
                    value={sessionalsWeight}
                    onChange={(e) => handleWeightChange('sessionals', e.target.value)}
                    className="border-border rounded-lg text-sm h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finals" className="text-xs font-semibold">Finals Weight (%)</Label>
                  <Input
                    id="finals"
                    type="number"
                    min="0"
                    max="100"
                    value={finalsWeight}
                    onChange={(e) => handleWeightChange('finals', e.target.value)}
                    className="border-border rounded-lg text-sm h-10"
                  />
                </div>
              </div>
              
              <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs font-medium">
                <p className="text-primary flex items-center gap-1.5">
                  <strong>Total: {sessionalsWeight + finalsWeight}%</strong>
                  {sessionalsWeight + finalsWeight === 100 
                    ? ' ✓ Weights are balanced' 
                    : ' ⚠️ Weights must sum to 100%'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lab Course Settings */}
          <Card className="rounded-xl border border-border bg-card micro-shadow">
            <CardHeader className="pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Lab Course Settings</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Configure how lab courses are counted in CGPA calculations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="labCreditHours" className="text-xs font-semibold">Lab Credit Hours</Label>
                  <Input
                    id="labCreditHours"
                    type="number"
                    min="1"
                    max="3"
                    value={labCreditHours}
                    onChange={(e) => setLabCreditHours(parseInt(e.target.value) || 1)}
                    className="border-border rounded-lg text-sm h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="labMaxMarks" className="text-xs font-semibold">Lab Total Marks</Label>
                  <Input
                    id="labMaxMarks"
                    type="number"
                    min="1"
                    max="200"
                    value={labMaxMarks}
                    onChange={(e) => setLabMaxMarks(parseInt(e.target.value) || 1)}
                    className="border-border rounded-lg text-sm h-10"
                  />
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary font-medium leading-relaxed">
                Lab component uses <strong>{labCreditHours} credit hour{labCreditHours !== 1 ? 's' : ''}</strong>.
                Raw lab marks are converted to percentage as{' '}
                <strong>(marks ÷ {labMaxMarks}) × 100</strong> before grading.
              </div>
            </CardContent>
          </Card>

          {/* Grade Boundaries */}
          <Card className="rounded-xl border border-border bg-card micro-shadow">
            <CardHeader className="pb-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Grade Boundaries</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Define percentage ranges and corresponding GPA values
                  </CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-0.5 rounded-full font-bold">
                  {gradeBoundaries.length} Grades
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {gradeBoundaries.map((boundary, index) => (
                <Card key={index} className="border border-border bg-card rounded-xl shadow-none overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-3 py-0.5 rounded-full font-extrabold">
                          {boundary.grade || 'N/A'}
                        </Badge>
                        <span className="text-xs font-semibold text-muted-foreground">
                          GPA: {boundary.gpa.toFixed(2)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGradeBoundary(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-8 px-2.5 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs font-semibold">Remove</span>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Grade</Label>
                        <Input
                          placeholder="A+"
                          value={boundary.grade}
                          onChange={(e) =>
                            handleGradeBoundaryChange(index, 'grade', e.target.value)
                          }
                          className="border-border rounded-lg text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Min %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={boundary.minPercentage}
                          onChange={(e) =>
                            handleGradeBoundaryChange(
                              index,
                              'minPercentage',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="border-border rounded-lg text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={boundary.maxPercentage}
                          onChange={(e) =>
                            handleGradeBoundaryChange(
                              index,
                              'maxPercentage',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="border-border rounded-lg text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">GPA</Label>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          step="0.1"
                          value={boundary.gpa}
                          onChange={(e) =>
                            handleGradeBoundaryChange(
                              index,
                              'gpa',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="border-border rounded-lg text-xs h-9"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleAddGradeBoundary}
                className="w-full border-dashed border-2 border-border hover:border-primary/50 hover:bg-muted/20 h-11 text-xs font-bold rounded-lg transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Grade Boundary
              </Button>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1 btn-premium-secondary text-sm h-11"
              size="lg"
            >
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 btn-premium-primary text-sm h-11"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormulaSettings;

