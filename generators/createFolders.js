const fs = require("fs-extra");
const path = require("path");

const { PROJECT_ROOT_FOLDERS } = require("../utils/constants");

const createFolders = async (projectPath, options = {}) => {
  const folders = [...PROJECT_ROOT_FOLDERS];

  for (const folder of folders) {
    await fs.ensureDir(path.join(projectPath, folder));
  }

  if (options.includeMVCStructure) {
    await fs.ensureDir(path.join(projectPath, "config"));
  }

  return projectPath;
};

module.exports = createFolders;
