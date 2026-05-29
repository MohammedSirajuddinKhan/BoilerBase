const fs = require("fs-extra");
const path = require("path");

const {
  buildPackageTemplate,
  buildEnvTemplate,
  buildDbTemplate,
  buildHomeControllerTemplate,
  buildIndexRouteTemplate,
  buildServerTemplate,
  buildAuthMiddlewareTemplate,
  buildUserModelTemplate,
  buildAuthControllerTemplate,
  buildAuthRoutesTemplate,
  buildIndexViewTemplate,
  buildLoginViewTemplate,
  buildRegisterViewTemplate,
  buildReadmeTemplate,
  buildPublicCssTemplate,
  buildPublicJsTemplate,
  getViewExtension,
  isAuthEnabled,
  isMongoDB,
  isMVC,
} = require("./templates");

const writeFile = async (filePath, contents) => {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, contents, "utf8");
};

const createFiles = async (projectPath, options) => {
  const viewExtension = getViewExtension(options);

  await writeFile(path.join(projectPath, "server.js"), buildServerTemplate(options));
  await writeFile(path.join(projectPath, "package.json"), buildPackageTemplate(options));
  await writeFile(path.join(projectPath, ".env"), buildEnvTemplate(options));
  await writeFile(path.join(projectPath, "config", "db.js"), buildDbTemplate(options));
  await writeFile(path.join(projectPath, "public", "css", "style.css"), buildPublicCssTemplate(options));
  await writeFile(path.join(projectPath, "public", "js", "main.js"), buildPublicJsTemplate(options));

  if (isMVC(options)) {
    await writeFile(path.join(projectPath, "controllers", "homeController.js"), buildHomeControllerTemplate(options));
    await writeFile(path.join(projectPath, "routes", "index.js"), buildIndexRouteTemplate(options));
  }

  if (isAuthEnabled(options)) {
    await writeFile(path.join(projectPath, "middleware", "authMiddleware.js"), buildAuthMiddlewareTemplate(options));
    await writeFile(path.join(projectPath, "controllers", "authController.js"), buildAuthControllerTemplate(options));
    await writeFile(path.join(projectPath, "routes", "authRoutes.js"), buildAuthRoutesTemplate(options));

    if (isMongoDB(options)) {
      await writeFile(path.join(projectPath, "models", "User.js"), buildUserModelTemplate(options));
    }
  }

  await writeFile(path.join(projectPath, "views", `index.${viewExtension}`), buildIndexViewTemplate(options));

  if (isAuthEnabled(options)) {
    await writeFile(path.join(projectPath, "views", `login.${viewExtension}`), buildLoginViewTemplate(options));
    await writeFile(path.join(projectPath, "views", `register.${viewExtension}`), buildRegisterViewTemplate(options));
  }

  if (options.includeREADME) {
    await writeFile(path.join(projectPath, "README.md"), buildReadmeTemplate(options));
  }

  return projectPath;
};

module.exports = createFiles;
