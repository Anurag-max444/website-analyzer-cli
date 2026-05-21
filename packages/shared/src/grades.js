/**
 * Shared Grade System
 * Used by: core analyzers, CLI, API, web dashboard
 */

const GRADES = {
  A: { letter: "A", emoji: "🟢", label: "Excellent", min: 90 },
  B: { letter: "B", emoji: "🟡", label: "Good", min: 75 },
  C: { letter: "C", emoji: "🟠", label: "Average", min: 60 },
  D: { letter: "D", emoji: "🔴", label: "Poor", min: 40 },
  F: { letter: "F", emoji: "💀", label: "Very Poor", min: 0 },
};

function getGrade(percentage) {
  if (percentage >= 90) return GRADES.A;
  if (percentage >= 75) return GRADES.B;
  if (percentage >= 60) return GRADES.C;
  if (percentage >= 40) return GRADES.D;
  return GRADES.F;
}

function calcPercentage(score, maxScore) {
  if (!maxScore || maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

module.exports = { GRADES, getGrade, calcPercentage };
