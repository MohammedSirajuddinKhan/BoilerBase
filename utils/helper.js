const { FORM_DEFAULTS } = require("./constants");

const normalizeOptions = (body = {}) => {
  const projectName = (body.projectName || "").trim();

  return {
    projectName,
    databaseChoice: body.databaseChoice || FORM_DEFAULTS.databaseChoice,
    authenticationType: body.authenticationType || FORM_DEFAULTS.authenticationType,
    templateEngine: body.templateEngine || FORM_DEFAULTS.templateEngine,
    cssFramework: body.cssFramework || FORM_DEFAULTS.cssFramework,
    includeMVCStructure: body.includeMVCStructure === "on" || body.includeMVCStructure === "true",
    includeAuthSystem: body.includeAuthSystem === "on" || body.includeAuthSystem === "true",
    includeREADME: body.includeREADME === "on" || body.includeREADME === "true",
  };
};

const validateOptions = (options) => {
  if (!options.projectName) {
    return "Project name is required.";
  }

  return null;
};

module.exports = {
  normalizeOptions,
  validateOptions,
};
