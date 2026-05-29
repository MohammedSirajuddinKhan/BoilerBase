const path = require("path");
const fs = require("fs-extra");

const createFolders = require("./createFolders");
const createFiles = require("./createFiles");
const { getProjectPath, sanitizeProjectName } = require("../utils/pathUtils");

const createProject = async (options) => {
  const displayProjectName = options.projectName.trim();
  const projectName = sanitizeProjectName(displayProjectName);
  const projectPath = getProjectPath(path.join(__dirname, ".."), projectName);

  await fs.remove(projectPath);
  await fs.ensureDir(projectPath);

  await createFolders(projectPath, options);
  await createFiles(projectPath, {
    ...options,
    projectName,
    displayProjectName,
  });

  return projectPath;
};

module.exports = createProject;
