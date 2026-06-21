"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {'sessionals' | 'complete'} CalculationType
 */

/**
 * @typedef {Object} GradeBoundary
 * @property {string} grade
 * @property {number} minPercentage
 * @property {number} maxPercentage
 * @property {number} gpa
 */

/**
 * @typedef {Object} FormulaSettings
 * @property {number} sessionalsWeight
 * @property {number} finalsWeight
 * @property {number} labCreditHours
 * @property {number} labMaxMarks
 * @property {GradeBoundary[]} gradeBoundaries
 */

/**
 * @typedef {Object} Course
 * @property {string} id
 * @property {string} name
 * @property {number} creditHours
 * @property {boolean} hasLab
 * @property {number} labMarks
 * @property {number} sessionalsMarks
 * @property {number} finalsMarks
 */

/**
 * @typedef {Object} CalculatorData
 * @property {Course[]} courses
 * @property {number | null} cgpa
 * @property {CalculationType} calculationType
 */

const defaultGradeBoundaries = [
  { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
  { grade: 'A', minPercentage: 85, maxPercentage: 89, gpa: 3.7 },
  { grade: 'B+', minPercentage: 80, maxPercentage: 84, gpa: 3.3 },
  { grade: 'B', minPercentage: 75, maxPercentage: 79, gpa: 3.0 },
  { grade: 'C+', minPercentage: 70, maxPercentage: 74, gpa: 2.7 },
  { grade: 'C', minPercentage: 65, maxPercentage: 69, gpa: 2.3 },
  { grade: 'D', minPercentage: 60, maxPercentage: 64, gpa: 2.0 },
  { grade: 'F', minPercentage: 0, maxPercentage: 59, gpa: 0.0 },
];

const defaultFormulaSettings = {
  sessionalsWeight: 30,
  finalsWeight: 70,
  labCreditHours: 1,
  labMaxMarks: 50,
  gradeBoundaries: defaultGradeBoundaries,
};

export const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getWeightedMarks = (course, calculationType, formulaSettings) => {
  const sessionals = toNumber(course.sessionalsMarks);
  const finals = toNumber(course.finalsMarks);
  const sessionalsWeight = toNumber(formulaSettings.sessionalsWeight);
  const finalsWeight = toNumber(formulaSettings.finalsWeight);

  if (calculationType === 'sessionals') {
    if (sessionals > sessionalsWeight) {
      return sessionals;
    }
    return sessionalsWeight > 0 ? (sessionals / sessionalsWeight) * 100 : 0;
  }

  if (sessionals > sessionalsWeight || finals > finalsWeight) {
    return (sessionals * sessionalsWeight / 100) + (finals * finalsWeight / 100);
  }
  return sessionals + finals;
};

export const getLabPercentage = (labMarks, labMaxMarks) => {
  const marks = toNumber(labMarks);
  const maxMarks = toNumber(labMaxMarks);

  if (maxMarks <= 0) return 0;

  return Math.min(100, Math.round((marks / maxMarks) * 10000) / 100);
};

export const findGradeBoundary = (weightedMarks, gradeBoundaries) => {
  const rounded = Math.round(toNumber(weightedMarks) * 100) / 100;
  
  const sorted = [...gradeBoundaries].sort((a, b) => b.minPercentage - a.minPercentage);

  const exactMatch = sorted.find(
    (boundary) => rounded >= boundary.minPercentage && rounded <= boundary.maxPercentage
  );
  if (exactMatch) {
    return exactMatch;
  }

  return sorted.find((boundary) => rounded >= boundary.minPercentage) ?? null;
};

export const normalizeFormulaSettings = (settings = {}) => {
  const sessionalsWeight = toNumber(settings.sessionalsWeight) || defaultFormulaSettings.sessionalsWeight;
  let finalsWeight = toNumber(settings.finalsWeight) || defaultFormulaSettings.finalsWeight;

  if (sessionalsWeight + finalsWeight !== 100) {
    finalsWeight = 100 - sessionalsWeight;
  }

  const gradeBoundaries = Array.isArray(settings.gradeBoundaries) && settings.gradeBoundaries.length > 0
    ? settings.gradeBoundaries.map((boundary) => ({
        grade: boundary.grade || '',
        minPercentage: toNumber(boundary.minPercentage),
        maxPercentage: toNumber(boundary.maxPercentage),
        gpa: toNumber(boundary.gpa),
      }))
    : defaultGradeBoundaries;

  return {
    sessionalsWeight,
    finalsWeight,
    labCreditHours: toNumber(settings.labCreditHours) || defaultFormulaSettings.labCreditHours,
    labMaxMarks: toNumber(settings.labMaxMarks) || defaultFormulaSettings.labMaxMarks,
    gradeBoundaries: [...gradeBoundaries].sort((a, b) => b.minPercentage - a.minPercentage),
  };
};

export const validateFormulaSettings = (settings) => {
  const normalized = normalizeFormulaSettings(settings);

  if (normalized.sessionalsWeight + normalized.finalsWeight !== 100) {
    return { valid: false, error: 'Sessionals and finals weights must sum to 100%' };
  }

  if (normalized.labCreditHours < 1 || normalized.labCreditHours > 3) {
    return { valid: false, error: 'Lab credit hours must be between 1 and 3' };
  }

  if (normalized.labMaxMarks < 1 || normalized.labMaxMarks > 200) {
    return { valid: false, error: 'Lab total marks must be between 1 and 200' };
  }

  if (normalized.gradeBoundaries.length === 0) {
    return { valid: false, error: 'At least one grade boundary is required' };
  }

  for (const boundary of normalized.gradeBoundaries) {
    if (!boundary.grade) {
      return { valid: false, error: 'All grade boundaries must have a grade letter' };
    }
    if (boundary.minPercentage < 0 || boundary.minPercentage > 100) {
      return { valid: false, error: 'Grade min percentage must be between 0 and 100' };
    }
    if (boundary.maxPercentage < 0 || boundary.maxPercentage > 100) {
      return { valid: false, error: 'Grade max percentage must be between 0 and 100' };
    }
    if (boundary.minPercentage > boundary.maxPercentage) {
      return { valid: false, error: 'Grade min percentage cannot exceed max percentage' };
    }
    if (boundary.gpa < 0 || boundary.gpa > 4) {
      return { valid: false, error: 'Grade GPA must be between 0 and 4' };
    }
  }

  return { valid: true, settings: normalized };
};

export const normalizeCourse = (course) => ({
  ...course,
  hasLab: Boolean(course.hasLab ?? course.isLab),
  sessionalsMarks: toNumber(course.sessionalsMarks),
  finalsMarks: toNumber(course.finalsMarks),
  labMarks: toNumber(course.labMarks),
  creditHours: toNumber(course.creditHours),
});

const CalculatorContext = createContext(undefined);

export const CalculatorProvider = ({ children }) => {
  const [formulaSettings, setFormulaSettings] = useState(defaultFormulaSettings);
  const [settingsReady, setSettingsReady] = useState(false);
  const [calculatorData, setCalculatorData] = useState({
    courses: [],
    cgpa: null,
    calculationType: 'complete',
  });

  useEffect(() => {
    const storedSettings = localStorage.getItem('formulaSettings');
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setFormulaSettings(normalizeFormulaSettings(parsed));
      } catch {
        setFormulaSettings(defaultFormulaSettings);
      }
    }

    const storedData = localStorage.getItem('calculatorData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setCalculatorData({
          ...parsed,
          courses: (parsed.courses || []).map((course) => ({
            ...course,
            hasLab: course.hasLab ?? course.isLab ?? false,
            labMarks: toNumber(course.labMarks),
          })),
        });
      } catch {
        setCalculatorData({ courses: [], cgpa: null, calculationType: 'complete' });
      }
    }

    setSettingsReady(true);
  }, []);

  const updateFormulaSettings = (settings) => {
    const normalized = normalizeFormulaSettings(settings);
    setFormulaSettings(normalized);
    localStorage.setItem('formulaSettings', JSON.stringify(normalized));
  };

  const calculateCGPA = (courses, calculationType, settings = formulaSettings) => {
    const activeSettings = normalizeFormulaSettings(settings);
    if (courses.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      const normalized = normalizeCourse(course);
      const weightedMarks = getWeightedMarks(normalized, calculationType, activeSettings);
      const theoryGrade = findGradeBoundary(weightedMarks, activeSettings.gradeBoundaries);

      if (theoryGrade) {
        totalPoints += theoryGrade.gpa * normalized.creditHours;
        totalCredits += normalized.creditHours;
      }

      if (normalized.hasLab) {
        const labPercentage = getLabPercentage(normalized.labMarks, activeSettings.labMaxMarks);
        const labGrade = findGradeBoundary(labPercentage, activeSettings.gradeBoundaries);
        if (labGrade) {
          totalPoints += labGrade.gpa * activeSettings.labCreditHours;
          totalCredits += activeSettings.labCreditHours;
        }
      }
    });

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return Math.round(cgpa * 100) / 100;
  };

  const setCalculatorDataWrapper = (data) => {
    setCalculatorData(data);
    localStorage.setItem('calculatorData', JSON.stringify(data));
  };

  return (
    <CalculatorContext.Provider
      value={{
        formulaSettings,
        settingsReady,
        updateFormulaSettings,
        calculatorData,
        setCalculatorData: setCalculatorDataWrapper,
        calculateCGPA,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
