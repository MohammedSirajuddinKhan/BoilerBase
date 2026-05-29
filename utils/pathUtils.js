const path = require("path");

const sanitizeProjectName = (value = "") => {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "my-app";
};

const toPackageName = (value = "") => sanitizeProjectName(value).toLowerCase();

const getProjectPath = (baseDir, projectName) =>
  path.join(baseDir, sanitizeProjectName(projectName));

module.exports = {
  sanitizeProjectName,
  toPackageName,
  getProjectPath,
};
