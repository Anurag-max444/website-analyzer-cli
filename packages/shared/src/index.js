/**
 * @website-analyzer/shared
 * Shared utilities — grades, constants, types
 */

const { GRADES, getGrade, calcPercentage } = require("./grades");
const {
  MODULES,
  TECH_CATEGORIES,
  CREDIT_COSTS,
  API_LIMITS,
  SUPPORTED_LANGS,
  DEFAULTS,
  TOOL_INFO,
} = require("./constants");

module.exports = {
  // Grades
  GRADES,
  getGrade,
  calcPercentage,

  // Constants
  MODULES,
  TECH_CATEGORIES,
  CREDIT_COSTS,
  API_LIMITS,
  SUPPORTED_LANGS,
  DEFAULTS,
  TOOL_INFO,
};
