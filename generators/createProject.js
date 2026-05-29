const fs = require("fs-extra");

const createFolders = require("./createFolders");
const createFiles = require("./createFiles");
const { getProjectPath, sanitizeProjectName } = require("../utils/pathUtils");

const createProject = async (options) => {
  const displayProjectName = options.projectName.trim();
  const projectName = sanitizeProjectName(displayProjectName);
  const targetDirectory = options.targetDirectory || process.cwd();
  const projectPath = getProjectPath(targetDirectory, projectName);

  if (await fs.pathExists(projectPath)) {
    const contents = await fs.readdir(projectPath);

    if (contents.length > 0) {
      throw new Error(
        `The folder "${projectName}" already exists and is not empty.`,
      );
    }
  }

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
