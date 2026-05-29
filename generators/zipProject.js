const path = require("path");
const fs = require("fs-extra");
const { spawn } = require("child_process");

const { sanitizeProjectName } = require("../utils/pathUtils");

const zipProject = async (projectPath, projectName) => {
  const outputDir = path.join(__dirname, "..", "generated-projects");
  const zipName = `${sanitizeProjectName(projectName)}.zip`;
  const zipPath = path.join(outputDir, zipName);
  const workerPath = path.join(__dirname, "zipWorker.js");

  await fs.ensureDir(outputDir);
  await fs.remove(zipPath);

  const child = spawn(process.execPath, [workerPath, projectPath, zipPath], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });

  child.unref();

  return zipPath;
};

module.exports = zipProject;
