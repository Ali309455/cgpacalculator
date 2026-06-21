"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ArrowLeft, ArrowRight, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCalculator,
  validateFormulaSettings,
} from '../contexts/CalculatorContext';

export const FormulaSettingsStep = ({ onBack, onContinue }) => {
  const { formulaSettings, settingsReady, updateFormulaSettings } = useCalculator();

  const [sessionalsWeight, setSessionalsWeight] = useState(formulaSettings.sessionalsWeight);
  const [finalsWeight, setFinalsWeight] = useState(formulaSettings.finalsWeight);
  const [labCreditHours, setLabCreditHours] = useState(formulaSettings.labCreditHours);
  const [labMaxMarks, setLabMaxMarks] = useState(formulaSettings.labMaxMarks);
  const [gradeBoundaries, setGradeBoundaries] = useState(formulaSettings.gradeBoundaries);

  useEffect(() => {
    if (!settingsReady) return;
    setSessionalsWeight(formulaSettings.sessionalsWeight);
    setFinalsWeight(formulaSettings.finalsWeight);
    setLabCreditHours(formulaSettings.labCreditHours);
    setLabMaxMarks(formulaSettings.labMaxMarks);
    setGradeBoundaries(formulaSettings.gradeBoundaries);
  }, [formulaSettings, settingsReady]);

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

  const handleContinue = () => {
    const draft = {
      sessionalsWeight,
      finalsWeight,
      labCreditHours,
      labMaxMarks,
      gradeBoundaries,
    };

    const result = validateFormulaSettings(draft);
    if (!result.valid) {
      toast.error(result.error);
      return;
    }

    updateFormulaSettings(result.settings);
    toast.success('Formula settings confirmed');
    onContinue(result.settings);
  };

  if (!settingsReady) {
    return (
      <Card className="rounded-xl border border-border bg-card micro-shadow">
        <CardContent className="py-12 text-center text-xs text-muted-foreground font-medium">
          Loading formula settings...
        </CardContent>
      </Card>
    );
  }

  const weightsBalanced = sessionalsWeight + finalsWeight === 100;

  return (
    <Card className="rounded-xl border border-border bg-card micro-shadow">
      <CardHeader className="pb-6 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center sm:text-left flex-1">
            <div className="mx-auto sm:mx-0 bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
              <Settings className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-extrabold tracking-tight">Confirm Formula Settings</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Review the grading formula before entering your courses. CGPA is calculated using these values.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            size="sm"
            className="rounded-lg h-9 text-xs font-semibold border-border hover:bg-muted/40 transition-all text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="mr-2 h-3.5 w-3.5" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flow-sessionals" className="text-xs font-semibold">Sessionals Weight (%)</Label>
            <Input
              id="flow-sessionals"
              type="number"
              min="0"
              max="100"
              value={sessionalsWeight}
              onChange={(e) => handleWeightChange('sessionals', e.target.value)}
              className="border-border rounded-lg text-sm h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flow-finals" className="text-xs font-semibold">Finals Weight (%)</Label>
            <Input
              id="flow-finals"
              type="number"
              min="0"
              max="100"
              value={finalsWeight}
              onChange={(e) => handleWeightChange('finals', e.target.value)}
              className="border-border rounded-lg text-sm h-10"
            />
          </div>
        </div>

        <div className={`p-3.5 rounded-lg border text-xs font-medium ${
          weightsBalanced
            ? 'bg-primary/5 border-primary/20 text-primary'
            : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-600'
        }`}>
          <p className="flex items-center gap-1.5">
            <strong>Total: {sessionalsWeight + finalsWeight}%</strong>
            {weightsBalanced
              ? ' — Weights are balanced'
              : ' — Weights must sum to 100% before continuing'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flow-lab" className="text-xs font-semibold">Lab Credit Hours</Label>
            <Input
              id="flow-lab"
              type="number"
              min="1"
              max="3"
              value={labCreditHours}
              onChange={(e) => setLabCreditHours(parseInt(e.target.value, 10) || 1)}
              className="border-border rounded-lg text-sm h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flow-lab-marks" className="text-xs font-semibold">Lab Total Marks</Label>
            <Input
              id="flow-lab-marks"
              type="number"
              min="1"
              max="200"
              value={labMaxMarks}
              onChange={(e) => setLabMaxMarks(parseInt(e.target.value, 10) || 1)}
              className="border-border rounded-lg text-sm h-10"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Lab marks are graded as <strong>(marks ÷ {labMaxMarks}) × 100%</strong>
        </p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground">Grade Boundaries</Label>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 rounded-full font-bold">{gradeBoundaries.length} grades</Badge>
          </div>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-4 gap-2 bg-muted/40 px-4 py-2 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
              <span>Grade</span>
              <span>Min %</span>
              <span>Max %</span>
              <span>GPA</span>
            </div>
            {gradeBoundaries.map((boundary, index) => (
              <div
                key={`${boundary.grade}-${index}`}
                className="grid grid-cols-4 gap-2 px-4 py-2 text-xs border-t border-border/60 first:border-t-0"
              >
                <span className="font-bold text-foreground">{boundary.grade}</span>
                <span className="text-muted-foreground">{boundary.minPercentage}</span>
                <span className="text-muted-foreground">{boundary.maxPercentage}</span>
                <span className="font-semibold text-primary">{boundary.gpa.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <Button variant="link" asChild className="px-0 h-auto text-xs text-primary hover:underline font-bold mt-2">
            <Link href="/FormulaSettings" className="inline-flex items-center gap-1">
              Edit full grade boundaries
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!weightsBalanced}
          className="w-full btn-premium-primary text-sm h-11"
          size="lg"
        >
          Confirm &amp; Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
